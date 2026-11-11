import { afterAll, describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { ME_PATH } from '../constants';
import { ERROR_CODES } from '../../src/i18n';
import { cleanup, loginUser } from '../helpers';
import { redis } from '../../src/database/redis';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import { env } from '../../src/config/env';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('authenticate middleware', () => {
  it('returns 401 when the header is missing', async () => {
    const res = await request(app).get(ME_PATH);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 401 when the word Bearer is missing', async () => {
    const { accessToken } = await loginUser();
    const res = await request(app).get(ME_PATH).set('Authorization', `${accessToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 401 when the token is invalid', async () => {
    const res = await request(app).get(ME_PATH).set('Authorization', 'Bearer fakeToken');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
  });

  it('returns 401 when the token is expired', async () => {
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

    const expiredToken = await new SignJWT({ role: 'customer' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(randomUUID())
      .setIssuedAt()
      .setExpirationTime('-1s')
      .sign(secret);

    const res = await request(app).get(ME_PATH).set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
  });
});
