import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { CREATE_WORKSPACE_PATH, UPDATE_WORKSPACE_PATH } from '../constants';
import { ERROR_CODES, FIELD_ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { addRoom, addWorkspace, cleanup, loginUser, trackWorkspace, validWorkspaceBody } from '../helpers';
import { redis } from '../../src/database/redis';
import { randomUUID } from 'node:crypto';
import { db } from '../../src/prisma/db';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('PATCH /owner/workspace accepted requests', () => {
  it('changes the name and the slug keep as-is', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const c = await request(app).post(CREATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    const u = await request(app)
      .patch(UPDATE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `updated ${body.name}` });

    trackWorkspace(c.body.data.id);

    expect(c.statusCode).toBe(201);
    expect(c.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(c.body.data.name).toBe(body.name);

    expect(u.statusCode).toBe(200);
    expect(u.body.code).toBe(SUCCESS_CODES.WORKSPACE_UPDATED);
    expect(u.body.data.name).not.toBe(c.body.data.name);
    expect(u.body.data.name).toBe(`updated ${c.body.data.name}`);
    expect(u.body.data.slug).toBe(c.body.data.slug);

    expect(u.body.data.floorCount).toBe(c.body.data.floorCount);
    expect(u.body.data.timezone).toBe(c.body.data.timezone);
  });

  it('changes the location city and the country keep as-is', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const c = await request(app).post(CREATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    const u = await request(app)
      .patch(UPDATE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: { city: 'Giza' } });

    trackWorkspace(c.body.data.id);

    expect(c.statusCode).toBe(201);
    expect(c.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(c.body.data.location.city).toBe(body.location.city);

    expect(u.statusCode).toBe(200);
    expect(u.body.code).toBe(SUCCESS_CODES.WORKSPACE_UPDATED);
    expect(u.body.data.location.city).not.toBe(c.body.data.location.city);
    expect(u.body.data.location.city).toBe('Giza');
    expect(u.body.data.location.country.iso2Code).toBe(c.body.data.location.country.iso2Code);
  });

  it('clears the description filed', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const c = await request(app).post(CREATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    const u = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({ description: null });

    trackWorkspace(c.body.data.id);

    expect(c.statusCode).toBe(201);
    expect(c.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);
    expect(c.body.data.description).toBe(body.description);

    expect(u.statusCode).toBe(200);
    expect(u.body.code).toBe(SUCCESS_CODES.WORKSPACE_UPDATED);
    expect(u.body.data.description).toBeNull();
  });

  it('returns the same workspace when passing {}', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const c = await request(app).post(CREATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    const u = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({});

    trackWorkspace(c.body.data.id);

    expect(c.statusCode).toBe(201);
    expect(c.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);

    expect(u.statusCode).toBe(200);
    expect(u.body.code).toBe(SUCCESS_CODES.WORKSPACE_UPDATED);

    expect(u.body.data).toEqual(c.body.data);
  });

  it('returns 200 even if fake ownerId, status, or slug', async () => {
    const { accessToken, id } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const c = await request(app).post(CREATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    const invalidUpdateVals = {
      ownerId: randomUUID(),
      status: 'inactive',
      slug: 'random-slug',
    };
    const u = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(invalidUpdateVals);

    const row = await db.orm.public.Workspace.where({ id: u.body.data.id }).first();

    trackWorkspace(c.body.data.id);

    expect(c.statusCode).toBe(201);
    expect(c.body.code).toBe(SUCCESS_CODES.WORKSPACE_CREATED);

    expect(u.statusCode).toBe(200);
    expect(u.body.code).toBe(SUCCESS_CODES.WORKSPACE_UPDATED);
    expect(u.body.data.status).toBe('active');
    expect(u.body.data.slug).toBe(c.body.data.slug);
    expect(row?.ownerId).toBe(id);
  });

  it('returns 400 when floorCount is below the highest room floor', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken); // floorCount is 3
    await addRoom(accessToken, { floorNumber: 3 });

    const res = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({ floorCount: 2 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_FLOOR_BELOW_ROOMS);
  });
});

describe('PATCH /owner/workspace rejected requests', () => {
  it('returns 401 without a token', async () => {
    const first = await request(app).patch(UPDATE_WORKSPACE_PATH).send({});
    const second = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', 'Bearer ').send({});
    const third = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', 'Bearer invalidToken').send({});

    expect(first.statusCode).toBe(401);
    expect(first.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(second.statusCode).toBe(401);
    expect(second.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(third.statusCode).toBe(401);
    expect(third.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({});

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it.each([
    ['400 for floorCount: 0', { floorCount: 0 }, 'floorCount', FIELD_ERROR_CODES.TOO_SMALL],
    ['400 for timezone Mars/City', { timezone: 'Mars/City' }, 'timezone', FIELD_ERROR_CODES.INVALID],
  ])('returns %s', async (_name, overrides, field, fieldErrorCode) => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody(overrides);
    const res = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send(body);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0].field).toBe(field);
    expect(res.body.error.details[0].code).toBe(fieldErrorCode);
  });

  it('returns 200 when floorCount equals the highest room floor', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    await addRoom(accessToken, { floorNumber: 3 });

    const res = await request(app).patch(UPDATE_WORKSPACE_PATH).set('Authorization', `Bearer ${accessToken}`).send({ floorCount: 3 });

    expect(res.statusCode).toBe(200);
  });
});
