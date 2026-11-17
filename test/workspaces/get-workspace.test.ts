import { beforeAll, afterAll, it, expect } from 'vitest';
import { redis } from '../../src/database/redis';
import { cleanup, loginUser, trackWorkspace, validWorkspaceBody } from '../helpers';
import { describe } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { CREATE_WORKSPACE_PATH, GET_MINE_WORKSPACE_PATH } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('GET /owner/workspace accepted requests', () => {
  it('returns 200 with the owner workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const body = await validWorkspaceBody();

    const createdWorkspaceRes = await request(app)
      .post(CREATE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body);

    const getWorkspaceRes = await request(app)
      .get(GET_MINE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`);

    trackWorkspace(createdWorkspaceRes.body.data.id);

    expect(createdWorkspaceRes.statusCode).toBe(201);
    expect(getWorkspaceRes.statusCode).toBe(200);
    expect(getWorkspaceRes.body.code).toBe(SUCCESS_CODES.WORKSPACE_FETCHED);
    expect(getWorkspaceRes.body.data).toEqual(createdWorkspaceRes.body.data);
  });
});

describe('GET /owner/workspace rejected requests', () => {
  it('returns 401 without a token', async () => {
    const first = await request(app).get(GET_MINE_WORKSPACE_PATH);
    const second = await request(app).get(GET_MINE_WORKSPACE_PATH).set('Authorization', 'Bearer ');
    const third = await request(app)
      .get(GET_MINE_WORKSPACE_PATH)
      .set('Authorization', 'Bearer invalidToken');

    expect(first.statusCode).toBe(401);
    expect(first.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(second.statusCode).toBe(401);
    expect(second.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);

    expect(third.statusCode).toBe(401);
    expect(third.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await request(app)
      .get(GET_MINE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .get(GET_MINE_WORKSPACE_PATH)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });
});
