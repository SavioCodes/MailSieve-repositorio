const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('GET /v1/health', () => {
  test('retorna 200 com x-api-key válida', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app).get('/v1/health').set('x-api-key', ctx.apiKey);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.name).toBe('MailSieve');
    } finally {
      ctx.cleanup();
    }
  });
});
