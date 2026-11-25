import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { CREATE_WORKSPACE_PATH } from '../constants';
import { ERROR_CODES, FIELD_ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { authed, cleanup, loginUser, trackWorkspace, validWorkspaceBody } from '../helpers';
import { redis } from '../../src/database/redis';
import { randomUUID } from 'node:crypto';
import { db } from '../../src/prisma/db';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('POST /owner/workspace accepted requests', () => {
  it('returns 201', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();
    const res = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send(body);

    trackWorkspace(res.body.data.id);

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(res.body.data.status).toBe('active');
    expect(res.body.data.slug.startsWith('test-space')).toBe(true);
    expect(res.body.data.location.country.iso2Code).toBe('EG');
  });

  it('returns 201 even if fake ownerId and status', async () => {
    const { accessToken, id } = await loginUser('owner');
    const ownerId = randomUUID();
    const body = await validWorkspaceBody({ ownerId, status: 'inactive' });
    const res = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send(body);
    const row = await db.orm.public.Workspace.where({ id: res.body.data.id }).first();

    trackWorkspace(res.body.data.id);

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(res.body.data.status).toBe('active');
    expect(row?.ownerId).toBe(id);

    expect(res.body.data.slug.startsWith('test-space')).toBe(true);
    expect(res.body.data.location.country.iso2Code).toBe('EG');
  });

  it('returns 409 for sending the same request twice ', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();
    const first = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send(body);
    const second = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send(body);

    trackWorkspace(first.body.data.id);

    expect(first.statusCode).toBe(201);
    expect(first.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(second.statusCode).toBe(409);
    expect(second.body.error.code).toBe(ERROR_CODES.WORKSPACE_OWNER_ALREADY_HAS_ONE);
  });
});

describe('POST /owner/workspace rejected requests', () => {
  it('returns 401 without a token', async () => {
    const first = await request(app).post(CREATE_WORKSPACE_PATH).send({});
    const second = await authed('post', CREATE_WORKSPACE_PATH, '').send({});
    const third = await authed('post', CREATE_WORKSPACE_PATH, 'bad token').send({});

    expect(first.statusCode).toBe(401);
    expect(first.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(second.statusCode).toBe(401);
    expect(second.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(third.statusCode).toBe(401);
    expect(third.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it.each([
    ['400 for floorCount: 0', { floorCount: 0 }, 'floorCount', FIELD_ERROR_CODES.TOO_SMALL],
    [
      '400 for timezone Mars/City',
      { timezone: 'Mars/City' },
      'timezone',
      FIELD_ERROR_CODES.INVALID,
    ],
    ['400 for a missing name', { name: undefined }, 'name', FIELD_ERROR_CODES.INVALID_TYPE],
  ])('returns %s', async (_name, overrides, field, fieldErrorCode) => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody(overrides);
    const res = await authed('post', CREATE_WORKSPACE_PATH, accessToken).send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0].field).toBe(field);
    expect(res.body.error.details[0].code).toBe(fieldErrorCode);
  });
});
