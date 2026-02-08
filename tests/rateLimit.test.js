const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('Rate limit', () => {
  test('retorna 429 ao exceder', async () => {
    const ctx = createTestApp({
      env: {
        RATE_LIMIT_MAX: '1',
        RATE_LIMIT_BURST: '1',
        RATE_LIMIT_COOLDOWN_MS: '5000'
      }
    });

    try {
      const first = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', ctx.apiKey)
        .send({ email: 'user@gmail.com' });
      const second = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', ctx.apiKey)
        .send({ email: 'user@gmail.com' });
      const third = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', ctx.apiKey)
        .send({ email: 'user@gmail.com' });

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(third.status).toBe(429);
      expect(third.body.error.code).toBe('rate_limited');
    } finally {
      ctx.cleanup();
    }
  });
});
