import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { redis } from '../../src/database/redis';
import { hashToken } from '../../src/utils/refresh-token';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { cleanup, cookieValue, findCookie, newEmail, trackToken } from '../helpers';
import { LOGIN_PATH, SIGNUP_PATH } from '../constants';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('POST /api/auth/login', () => {
  // validation
  it.each([
    ['invalid email', { email: 'bad', password: '12345678' }, 'email', 'INVALID_FORMAT'],
    ['empty password', { email: 'a@e.com', password: '' }, 'password', 'TOO_SMALL'],
  ])('rejects %s (400)', async (_name, body, field, code) => {
    const res = await request(app).post(LOGIN_PATH).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0]).toMatchObject({ field, code });
  });

  // invalid credientails
  it('rejects not existing email (401)', async () => {
    const res = await request(app)
      .post(LOGIN_PATH)
      .send({ email: 'a@e.com', password: '12345678' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  it('rejects wrong password (401)', async () => {
    const email = newEmail();
    const body = { email, password: '12345678' };
    await request(app).post(SIGNUP_PATH).send(body);

    const res = await request(app).post(LOGIN_PATH).send({ email, password: 'wrong_password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  // valid credinetails
  it('create access & refresh tokens (200)', async () => {
    const email = newEmail();
    const body = { email, password: '12345678' };
    await request(app).post(SIGNUP_PATH).send(body);

    const res = await request(app).post(LOGIN_PATH).send(body);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.AUTH_LOGIN_SUCCESS);
    expect(res.body.data.user.email).toBe(email);

    expect(typeof res.body.data.accessToken).toBe('string');

    expect(res.body.data).not.toHaveProperty('refreshToken');

    const refreshTokenCookie = findCookie(res.headers['set-cookie'], 'refreshToken');
    const refreshToken = cookieValue(res.headers['set-cookie'], 'refreshToken');
    trackToken(refreshToken);

    expect(refreshTokenCookie).toContain('HttpOnly');

    const tokenData = await authRepository.findToken(hashToken(refreshToken));
    if (tokenData)
      expect(tokenData).toMatchObject({ userId: res.body.data.user.id, status: 'valid' });
  });
});
