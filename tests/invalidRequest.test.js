const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('Invalid request', () => {
  test('payload inválido retorna 400 com Error Model', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', ctx.apiKey)
        .send({ email: 'email-invalido' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('invalid_request');
      expect(typeof response.body.error.request_id).toBe('string');
    } finally {
      ctx.cleanup();
    }
  });
});
