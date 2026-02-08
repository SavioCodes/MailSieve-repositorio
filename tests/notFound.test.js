const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('Not found', () => {
  test('rota inexistente retorna 404 com Error Model', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app).get('/v1/nao-existe').set('x-api-key', ctx.apiKey);
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('not_found');
      expect(typeof response.body.error.request_id).toBe('string');
    } finally {
      ctx.cleanup();
    }
  });
});
