const { createProviderClient } = require('../dist/src/services/provider/providerClient');

describe('providerClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('retorna provider_unavailable quando fetch falha', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));

    const client = createProviderClient({
      enabled: true,
      baseUrl: 'https://provider.example.test',
      apiKey: 'secret',
      path: '/v1/endpoint',
      timeoutMs: 150,
      retries: 1,
      logWarn: () => {}
    });

    const result = await client.call({ payload: true }, 'req-1');

    expect(fetchMock).toHaveBeenCalled();
    expect(result.status).toBe('provider_unavailable');
  });

  test('retorna ok quando provedor responde 200', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true })
    });

    const client = createProviderClient({
      enabled: true,
      baseUrl: 'https://provider.example.test',
      apiKey: 'secret',
      path: '/v1/endpoint',
      timeoutMs: 150,
      retries: 1,
      logWarn: () => {}
    });

    const result = await client.call({ payload: true }, 'req-2');

    expect(result.status).toBe('ok');
  });
});