import { readJsonFile, writeJsonFile } from '../../utils/fileStore';

interface UsageEvent {
  ts: number;
  latency_ms: number;
  is_error: boolean;
}

interface UsageByKey {
  events: UsageEvent[];
  last_seen_at: string | null;
}

interface UsageState {
  started_at: string;
  keys: Record<string, UsageByKey>;
}

interface UsageServiceOptions {
  persistenceMode: 'memory' | 'file';
  stateFile: string;
  retentionMs: number;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function createUsageMetricsService(options: UsageServiceOptions) {
  const defaultState: UsageState = {
    started_at: new Date().toISOString(),
    keys: {}
  };

  const state =
    options.persistenceMode === 'file'
      ? readJsonFile<UsageState>(options.stateFile, defaultState)
      : defaultState;

  function persist(): void {
    if (options.persistenceMode === 'file') {
      writeJsonFile(options.stateFile, state);
    }
  }

  function getOrCreate(apiKey: string): UsageByKey {
    if (!state.keys[apiKey]) {
      state.keys[apiKey] = {
        events: [],
        last_seen_at: null
      };
    }

    return state.keys[apiKey];
  }

  function trimRetention(events: UsageEvent[], now: number): UsageEvent[] {
    const minTs = now - options.retentionMs;
    return events.filter((event) => event.ts >= minTs);
  }

  function record(apiKey: string | undefined, statusCode: number, latencyMs: number): void {
    if (!apiKey) {
      return;
    }

    const now = Date.now();
    const item = getOrCreate(apiKey);
    item.events.push({
      ts: now,
      latency_ms: Math.max(0, Math.round(latencyMs)),
      is_error: statusCode >= 400
    });
    item.events = trimRetention(item.events, now);
    item.last_seen_at = new Date(now).toISOString();
    persist();
  }

  function report(windowMs?: number): {
    generated_at: string;
    started_at: string;
    window_ms: number | null;
    summary: {
      requests_total: number;
      errors_total: number;
      key_count: number;
    };
    keys: Record<
      string,
      {
        requests_total: number;
        errors_total: number;
        latency_avg_ms: number;
        latency_p95_ms: number;
        last_seen_at: string | null;
      }
    >;
  } {
    const now = Date.now();
    const minTs = windowMs ? now - windowMs : Number.MIN_SAFE_INTEGER;

    const keys: Record<
      string,
      {
        requests_total: number;
        errors_total: number;
        latency_avg_ms: number;
        latency_p95_ms: number;
        last_seen_at: string | null;
      }
    > = {};

    let requestsTotal = 0;
    let errorsTotal = 0;

    Object.entries(state.keys).forEach(([apiKey, item]) => {
      const events = item.events.filter((event) => event.ts >= minTs);
      const requests = events.length;
      const errors = events.filter((event) => event.is_error).length;
      const latencies = events.map((event) => event.latency_ms);

      const avgLatency = latencies.length
        ? latencies.reduce((sum, value) => sum + value, 0) / latencies.length
        : 0;

      keys[apiKey] = {
        requests_total: requests,
        errors_total: errors,
        latency_avg_ms: Number(avgLatency.toFixed(2)),
        latency_p95_ms: percentile(latencies, 95),
        last_seen_at: item.last_seen_at
      };

      requestsTotal += requests;
      errorsTotal += errors;
    });

    return {
      generated_at: new Date(now).toISOString(),
      started_at: state.started_at,
      window_ms: windowMs ?? null,
      summary: {
        requests_total: requestsTotal,
        errors_total: errorsTotal,
        key_count: Object.keys(keys).length
      },
      keys
    };
  }

  return {
    record,
    report
  };
}