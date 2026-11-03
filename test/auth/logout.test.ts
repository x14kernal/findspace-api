import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { redis } from '../../src/database/redis';
import { SUCCESS_CODES } from '../../src/i18n';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { hashToken } from '../../src/utils/refresh-token';
import { cleanup, findCookie, loginUser, logoutWith } from '../helpers';
import { LOGOUT_PATH, REFRESH_PATH } from '../constants';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('POST /api/auth/logout', () => {
  it('ends the session (200)', async () => {
    const { refreshToken } = await loginUser();
    const res = await logoutWith(refreshToken);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.AUTH_LOGOUT_SUCCESS);
    expect(findCookie(res.headers['set-cookie'], 'refreshToken')).toContain('refreshToken=;');

    // the session is gone from Redis
    expect(await authRepository.findToken(hashToken(refreshToken))).toBeNull();

    // and the token no longer works
    const refresh = await request(app)
      .post(REFRESH_PATH)
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refresh.status).toBe(401);
  });

  it('works without a cookie (200)', async () => {
    const res = await request(app).post(LOGOUT_PATH);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.AUTH_LOGOUT_SUCCESS);
  });

  it('works when called twice (200)', async () => {
    const { refreshToken } = await loginUser();

    const first = await logoutWith(refreshToken);
    const second = await logoutWith(refreshToken);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.code).toBe(SUCCESS_CODES.AUTH_LOGOUT_SUCCESS);
  });
});
