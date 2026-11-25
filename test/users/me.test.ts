import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { redis } from '../../src/database/redis';
import { authed, cleanup, getTestCountry, loginUser, userWithProfile } from '../helpers';
import { PATHS } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { SignJWT } from 'jose';
import { env } from '../../src/config/env';
import { randomUUID } from 'node:crypto';
import type { CreateProfileInput } from '../../src/types/profile.types';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

const buildBody = async (): Promise<CreateProfileInput> => {
  const country = await getTestCountry();
  return {
    firstName: 'Muhammed',
    lastName: 'Ahmed',
    location: { countryId: country!.id },
  };
};

describe('Get /me', () => {
  it('fetches logged in user has no profile', async () => {
    const { accessToken, id, email } = await loginUser();
    const res = await authed('get', PATHS.me, accessToken);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_FETCH_SUCCESS);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.profile).toBeNull();
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('fetches logged in user profile', async () => {
    const { accessToken, body, country } = await userWithProfile();
    const res = await authed('get', PATHS.me, accessToken);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_FETCH_SUCCESS);
    expect(res.body.data.profile).not.toBeNull();
    expect(res.body.data.profile.firstName).toBe(body.firstName);
    expect(res.body.data.profile.lastName).toBe(body.lastName);
    expect(res.body.data.profile.location.country.iso2Code).toBe(country?.iso2Code);
  });

  it('returns 404 when the user not found', async () => {
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    const token = await new SignJWT({ role: 'customer' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(randomUUID())
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(secret);
    const res = await authed('get', PATHS.me, token);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.USER_NOT_FOUND);
  });
});

describe('POST /me/profile', () => {
  it('creates a profile', async () => {
    const { accessToken } = await loginUser();
    const body = await buildBody();

    const res = await authed('post', PATHS.profile, accessToken).send(body);

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_CREATE_SUCCESS);
    expect(res.body.data.profile.firstName).toBe(body.firstName);
    expect(res.body.data.profile.lastName).toBe(body.lastName);
    expect(res.body.data.profile).not.toHaveProperty('userId');
    expect(res.body.data.profile).not.toHaveProperty('locationId');
    expect(res.body.data.profile.location.country.iso2Code).toBe('EG');

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.firstName).toBe(body.firstName);
  });

  it('returns 401 when there is no token', async () => {
    const res = await authed('post', PATHS.profile, '').send(await buildBody());

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 409 when the profile already exists', async () => {
    const { accessToken } = await loginUser();
    const body = await buildBody();

    const first = await authed('post', PATHS.profile, accessToken).send(body);
    expect(first.status).toBe(201);

    const second = await authed('post', PATHS.profile, accessToken).send(body);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe(ERROR_CODES.PROFILE_ALREADY_EXISTS);
  });

  it('returns 422 when the country does not exist', async () => {
    const { accessToken } = await loginUser();
    const body = await buildBody();
    body.location.countryId = randomUUID();

    const res = await authed('post', PATHS.profile, accessToken).send(body);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe(ERROR_CODES.COUNTRY_NOT_FOUND);
  });

  it.each([
    ['firstName is missing', { firstName: undefined }],
    ['an unknown field is sent', { role: 'admin' }],
    ['phone number is not valid', { phoneNumber: '123' }],
    ['userId is sent', { userId: randomUUID() }],
  ])('returns 400 when %s', async (_name, change) => {
    const { accessToken } = await loginUser();
    const body = { ...(await buildBody()), ...change };

    const res = await authed('post', PATHS.profile, accessToken).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});

describe('PATCH /me/profile', () => {
  it('updates only the sent fields', async () => {
    const { accessToken, body, country } = await userWithProfile();
    const update = { firstName: 'Ali' };
    const res = await authed('patch', PATHS.profile, accessToken).send(update);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_UPDATE_SUCCESS);
    expect(res.body.data.profile.firstName).toBe(update.firstName);
    expect(res.body.data.profile.lastName).toBe(body.lastName);
    expect(res.body.data.profile.location.country.iso2Code).toBe(country?.iso2Code);

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.firstName).toBe(update.firstName);
  });

  it('changes nothing when the body is empty', async () => {
    const { accessToken } = await userWithProfile();
    const update = {};
    const me1 = await authed('get', PATHS.me, accessToken);

    const res = await authed('patch', PATHS.profile, accessToken).send(update);
    expect(res.status).toBe(200);

    const me2 = await authed('get', PATHS.me, accessToken);
    expect(me1.body).toEqual(me2.body);
  });

  it('clears bio when null is sent', async () => {
    const { accessToken, body } = await userWithProfile();
    const update = { bio: null };
    const res = await authed('patch', PATHS.profile, accessToken).send(update);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_UPDATE_SUCCESS);
    expect(res.body.data.profile.phoneNumber).toBe(body.phoneNumber);
    expect(res.body.data.profile.bio).toBeNull();

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.bio).toBeNull();
  });

  it('updates the location city', async () => {
    const { accessToken } = await userWithProfile();
    const update = { location: { city: 'madinty' } };
    const res = await authed('patch', PATHS.profile, accessToken).send(update);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_UPDATE_SUCCESS);
    expect(res.body.data.profile.location.city).toBe(update.location.city);

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.location.city).toBe(update.location.city);
  });

  it('returns 404 when the user has no profile', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('patch', PATHS.profile, accessToken).send({ firstName: 'Ali' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.PROFILE_NOT_FOUND);
  });

  it('returns 422 when the new country does not exist', async () => {
    const { accessToken } = await userWithProfile();
    const res = await authed('patch', PATHS.profile, accessToken).send({
      location: { countryId: randomUUID() },
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe(ERROR_CODES.COUNTRY_NOT_FOUND);
  });

  it.each([
    ['when locationId is sent', { locationId: randomUUID() }],
    ['when location.id is sent', { location: { id: randomUUID() } }],
    ['firstName is null', { firstName: null }],
    ['lastName is null', { lastName: null }],
  ])('returns 400 %s', async (_name, body) => {
    const { accessToken } = await userWithProfile();
    const res = await authed('patch', PATHS.profile, accessToken).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 401 without a token', async () => {
    const res = await authed('patch', PATHS.profile, '').send({
      locationId: randomUUID(),
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });
});
