import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('error handler', () => {
  it('rejects a broken JSON body (400)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .set('Content-Type', 'application/json')
      .send('{bad json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON_ERROR');
  });
});
