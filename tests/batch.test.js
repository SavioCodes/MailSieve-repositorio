const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('POST /v1/batch', () => {
  test('retorna lista com mesmo tamanho', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app)
        .post('/v1/batch')
        .set('x-api-key', ctx.apiKey)
        .send({ emails: ['um@mailinator.com', 'dois@gmail.com', 'tres@10minutemail.com'] });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(3);
    } finally {
      ctx.cleanup();
    }
  });
});