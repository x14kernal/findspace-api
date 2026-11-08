import { afterAll, afterEach, beforeAll, describe, vi, it, expect } from 'vitest';
import request from 'supertest';
import { verifyGoogleIdToken } from '../../src/integrations/google/google.client';
import { redis } from '../../src/database/redis';
import { cleanup, cookieValue, findCookie, newEmail, trackToken } from '../helpers';
import { GOOGLE_PATH, SIGNUP_PATH } from '../constants';
import { randomUUID } from 'node:crypto';
import app from '../../src/app';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { hashToken } from '../../src/utils/refresh-token';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { usersRepository } from '../../src/modules/users/users.repository';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';

vi.mock('../../src/integrations/google/google.client'); // replace real fucntions in this file

// make `verifyGoogleIdToken` responses with success
const mockGoogle = (googleId: string, email: string) =>
  vi.mocked(verifyGoogleIdToken).mockResolvedValue({ googleId, email });

beforeAll(() => redis.connect());
afterEach(() => vi.resetAllMocks());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('POST /api/auth/google', () => {
  it('creates a new user (201)', async () => {
    const email = newEmail();
    mockGoogle(randomUUID(), email);

    const res = await request(app).post(GOOGLE_PATH).send({ idToken: 'fake', role: 'owner' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.AUTH_SIGNUP_SUCCESS);
    expect(res.body.data.user).toMatchObject({ email, role: 'owner' });

    expect(typeof res.body.data.accessToken).toBe('string');
    expect(res.body.data).not.toHaveProperty('refreshToken');

    const refreshTokenCookie = findCookie(res.headers['set-cookie'], 'refreshToken');
    expect(refreshTokenCookie).toContain('HttpOnly');

    const refreshToken = cookieValue(res.headers['set-cookie'], 'refreshToken');
    trackToken(refreshToken);

    const tokenData = await authRepository.findToken(hashToken(refreshToken));
    expect(tokenData).toMatchObject({ userId: res.body.data.user.id, status: 'valid' });
  });

  it('logs in an existing Google user (200)', async () => {
    const googleId = randomUUID();
    const email = newEmail();
    mockGoogle(googleId, email);

    const first = await request(app).post(GOOGLE_PATH).send({ idToken: 'fake', role: 'owner' });
    expect(first.status).toBe(201);
    trackToken(cookieValue(first.headers['set-cookie'], 'refreshToken'));

    const second = await request(app).post(GOOGLE_PATH).send({ idToken: 'fake', role: 'customer' });
    expect(second.status).toBe(200);
    expect(second.body.code).toBe(SUCCESS_CODES.AUTH_LOGIN_SUCCESS);
    expect(second.body.data.user).toMatchObject({ email, role: 'owner' });
    expect(second.body.data.user.id).toBe(first.body.data.user.id);

    const refreshToken = cookieValue(second.headers['set-cookie'], 'refreshToken');
    trackToken(refreshToken);

    const tokenData = await authRepository.findToken(hashToken(refreshToken));
    expect(tokenData).toMatchObject({ userId: second.body.data.user.id, status: 'valid' });
  });

  it('rejects A Google login with an email that already belongs to a password account (409)', async () => {
    const googleId = randomUUID();
    const email = newEmail();

    const first = await request(app).post(SIGNUP_PATH).send({ email, password: '12345678' });
    expect(first.status).toBe(201);

    mockGoogle(googleId, email);
    const second = await request(app).post(GOOGLE_PATH).send({ idToken: 'fake' });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe(ERROR_CODES.AUTH_GOOGLE_ACCOUNT_NOT_LINKED);

    const refreshTokenCookie = findCookie(second.headers['set-cookie'], 'refreshToken');
    expect(refreshTokenCookie).toBeUndefined();

    const user = await usersRepository.findByEmail(email);
    expect(user?.googleId).toBeNull();
  });

  it('rejects an invalid Google token (401)', async () => {
    vi.mocked(verifyGoogleIdToken).mockRejectedValue(
      new UnauthorizedError('Invalid Google token.', ERROR_CODES.AUTH_GOOGLE_TOKEN_INVALID),
    );

    const res = await request(app).post(GOOGLE_PATH).send({ idToken: 'fake' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_GOOGLE_TOKEN_INVALID);
    expect(findCookie(res.headers['set-cookie'], 'refreshToken')).toBeUndefined();
  });

  it.each([
    ['no idToken', {}, 'idToken', 'INVALID_TYPE'],
    ['an empty idToken', { idToken: '' }, 'idToken', 'TOO_SMALL'],
    ['the admin role', { idToken: 'fake', role: 'admin' }, 'role', 'INVALID_VALUE'],
  ])('rejects %s (400)', async (_name, body, field, code) => {
    const res = await request(app).post(GOOGLE_PATH).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0]).toMatchObject({ field, code });
    expect(verifyGoogleIdToken).not.toHaveBeenCalled();
  });
});
