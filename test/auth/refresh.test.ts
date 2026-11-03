import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { redis } from '../../src/database/redis';
import { cleanup, cookieValue, findCookie, loginUser, refreshWith } from '../helpers';
import { REFRESH_PATH } from '../constants';
import { ERROR_CODES } from '../../src/i18n';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { hashToken } from '../../src/utils/refresh-token';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('POST /api/auth/refresh', () => {
  it('returns a new access token and a new cookie (200)', async () => {
    const { refreshToken } = await loginUser();

    const res = await request(app).post(REFRESH_PATH).set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(cookieValue(res.headers['set-cookie'], 'refreshToken')).not.toBe(refreshToken);
  });

  it.each([
    ['no cookie', undefined, false],
    ['a fake cookie', 'refreshToken=not-a-real-token', true],
  ])('rejects %s (401)', async (_name, cookie, clearsCookie) => {
    const req = request(app).post(REFRESH_PATH);
    if (cookie) req.set('Cookie', cookie);
    const res = await req;

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID);

    const cleared =
      findCookie(res.headers['set-cookie'], 'refreshToken')?.includes('refreshToken=;') ?? false;
    expect(cleared).toBe(clearsCookie);
  });

  it('rejects an old token after rotation (401)', async () => {
    const { refreshToken: a } = await loginUser();

    const first = await refreshWith(a);
    expect(first.status).toBe(200);

    const again = await refreshWith(a);
    expect(again.status).toBe(401);
    expect(again.body.error.code).toBe(ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID);
  });

  it('kills the family when a used token comes back (401)', async () => {
    const { refreshToken: a } = await loginUser();

    const first = await refreshWith(a);
    expect(first.status).toBe(200);

    const b = cookieValue(first.headers['set-cookie'], 'refreshToken');
    expect(await authRepository.findToken(hashToken(b))).toMatchObject({ status: 'valid' });

    // 1. send A again: expect 401
    const second = await refreshWith(a);
    expect(second.status).toBe(401);
    expect(second.body.error.code).toBe(ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID);

    expect(await authRepository.findToken(hashToken(b))).toBeNull();

    // 2. send B: expect 401 too
    const third = await refreshWith(b);
    expect(third.status).toBe(401);
    expect(third.body.error.code).toBe(ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID);
  });

  it('keeps working when the user refreshes again and again (200)', async () => {
    const { refreshToken: a } = await loginUser();

    const first = await refreshWith(a);
    const b = cookieValue(first.headers['set-cookie'], 'refreshToken');

    const second = await refreshWith(b);
    const c = cookieValue(second.headers['set-cookie'], 'refreshToken');

    const third = await refreshWith(c);

    expect(third.status).toBe(200);

    const d = cookieValue(third.headers['set-cookie'], 'refreshToken');

    expect(new Set([a, b, c, d]).size).toBe(4);

    for (const token of [a, b, c]) {
      expect(await authRepository.findToken(hashToken(token))).toMatchObject({ status: 'used' });
    }
    expect(await authRepository.findToken(hashToken(d))).toMatchObject({ status: 'valid' });
  });
});
