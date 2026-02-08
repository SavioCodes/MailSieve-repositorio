const request = require('supertest');
const { createTestApp } = require('./helpers/testApp');

describe('Auth', () => {
  test('missing x-api-key retorna 401', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app).post('/v1/generate').send({ email: 'user@mailinator.com' });
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('auth_missing');
    } finally {
      ctx.cleanup();
    }
  });

  test('x-api-key inválida retorna 401', async () => {
    const ctx = createTestApp();
    try {
      const response = await request(ctx.app)
        .post('/v1/generate')
        .set('x-api-key', 'invalid-key')
        .send({ email: 'user@mailinator.com' });
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('auth_invalid');
    } finally {
      ctx.cleanup();
    }
  });
});
