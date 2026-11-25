import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PATHS } from '../constants';
import { ERROR_CODES, FIELD_ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { addWorkspace, authed, cleanup, loginUser, validAvailabilityBody } from '../helpers';
import { redis } from '../../src/database/redis';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('GET /owner/workspace/availability', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('get', PATHS.workspaceAvailability, '').set(
      'Authorization',
      'Bearer ',
    );

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 403 for a cutomer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('get', PATHS.workspaceAvailability, accessToken).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('get', PATHS.workspaceAvailability, accessToken).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns 200 with { availabilities: [] }', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);

    const res = await authed('get', PATHS.workspaceAvailability, accessToken).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_FETCHED);
    expect(res.body.data).toEqual({ availabilities: [] });
  });
});

describe('PUT /owner/workspace/availability rejected', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('put', PATHS.workspaceAvailability, '').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 403 for a cutomer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({ availabilities: [] }),
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns 400 for bad input', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 400 for a bad time', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({
        availabilities: [{ dayOfWeek: '1', startAt: '9:00', endAt: '25:00' }],
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 400 when startAt is after endAt', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({
        availabilities: [{ dayOfWeek: '1', startAt: '16:00', endAt: '13:00' }],
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 400 for a repeated dayOfWeek', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({
        availabilities: [
          { dayOfWeek: '1', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '1', startAt: '10:00', endAt: '13:00' },
        ],
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 400 for a bad day 8', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({
        availabilities: [{ dayOfWeek: '8', startAt: '10:00', endAt: '13:00' }],
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns 400 for more than 7 items', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({
        availabilities: [
          { dayOfWeek: '1', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '2', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '3', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '4', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '5', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '6', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '7', startAt: '10:00', endAt: '13:00' },
          { dayOfWeek: '7', startAt: '10:00', endAt: '13:00' },
        ],
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details).toContainEqual(
      expect.objectContaining({ field: 'availabilities', code: FIELD_ERROR_CODES.TOO_BIG }),
    );
  });
});

describe('PUT /owner/workspace/availability accepted', () => {
  it('returns 200', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const payload1 = [
      { dayOfWeek: '1', startAt: '09:00', endAt: '17:00' },
      { dayOfWeek: '2', startAt: '09:00', endAt: '17:00' },
    ];
    const payload2 = [
      { dayOfWeek: '3', startAt: '09:00', endAt: '17:00' },
      { dayOfWeek: '4', startAt: '09:00', endAt: '17:00' },
    ];
    const payload3: [] = [];

    const put1 = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({ availabilities: payload1 }),
    );

    const put2 = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({ availabilities: payload2 }),
    );

    const res2 = await authed('get', PATHS.workspaceAvailability, accessToken).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    const put3 = await authed('put', PATHS.workspaceAvailability, accessToken).send(
      validAvailabilityBody({ availabilities: payload3 }),
    );

    const res3 = await authed('get', PATHS.workspaceAvailability, accessToken).set(
      'Authorization',
      `Bearer ${accessToken}`,
    );

    expect(put1.statusCode).toBe(200);
    expect(put1.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_UPDATED);
    expect(put1.body.data.availabilities).toEqual(payload1);

    expect(put2.statusCode).toBe(200);
    expect(put2.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_UPDATED);
    expect(put2.body.data.availabilities).toEqual(payload2);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_FETCHED);
    expect(res2.body.data.availabilities).toEqual(payload2);

    expect(put3.statusCode).toBe(200);
    expect(put3.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_UPDATED);
    expect(put3.body.data.availabilities).toEqual(payload3);

    expect(res3.statusCode).toBe(200);
    expect(res3.body.code).toBe(SUCCESS_CODES.WORKSPACE_AVAILABILITY_FETCHED);
    expect(res3.body.data.availabilities).toEqual(payload3);
  });
});
