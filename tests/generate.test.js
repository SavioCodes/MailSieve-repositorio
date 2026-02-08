const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('POST /v1/generate', () => {
  test('retorna is_disposable=true para domínio local', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', ctx.apiKey)
        .send({ email: 'teste@mailinator.com' });

      expect(response.status).toBe(200);
      expect(response.body.is_disposable).toBe(true);
      expect(response.body.risk_level).toBe('high');
    } finally {
      ctx.cleanup();
    }
  });
});