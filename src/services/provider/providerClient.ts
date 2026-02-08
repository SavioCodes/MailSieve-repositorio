function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface ProviderOptions {
  enabled: boolean;
  baseUrl?: string;
  apiKey?: string;
  path?: string;
  timeoutMs: number;
  retries: number;
  logWarn: (payload: Record<string, unknown>) => void;
}

export type ProviderCallResult =
  | { status: 'disabled' }
  | { status: 'ok'; raw: unknown }
  | { status: 'provider_unavailable' };

export function createProviderClient(options: ProviderOptions) {
  const normalizedBaseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : undefined;

  async function call(payload: Record<string, unknown>, requestId: string): Promise<ProviderCallResult> {
    if (!options.enabled || !normalizedBaseUrl || !options.apiKey || !options.path) {
      return { status: 'disabled' };
    }

    const endpoint = `${normalizedBaseUrl}${options.path}`;

    for (let attempt = 0; attempt <= options.retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${options.apiKey}`,
            'x-request-id': requestId
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          options.logWarn({
            event: 'provider_http_error',
            request_id: requestId,
            status: response.status,
            attempt
          });

          if (attempt < options.retries) {
            await sleep(150 * (attempt + 1));
            continue;
          }

          return { status: 'provider_unavailable' };
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          return {
            status: 'ok',
            raw: await response.json()
          };
        }

        return {
          status: 'ok',
          raw: await response.text()
        };
      } catch {
        clearTimeout(timeout);
        options.logWarn({
          event: 'provider_fetch_error',
          request_id: requestId,
          attempt
        });

        if (attempt < options.retries) {
          await sleep(150 * (attempt + 1));
          continue;
        }

        return { status: 'provider_unavailable' };
      }
    }

    return { status: 'provider_unavailable' };
  }

  return {
    call
  };
}