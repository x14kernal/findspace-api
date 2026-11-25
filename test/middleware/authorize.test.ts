import { afterAll, describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PATHS } from '../constants';
import { ERROR_CODES } from '../../src/i18n';
import { cleanup, loginUser } from '../helpers';
import { redis } from '../../src/database/redis';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('authorize middleware', () => {
  it('returns 403 when the role is not owner', async () => {
    const { accessToken } = await loginUser(); // by defualt is customer
    const res = await request(app)
      .get(PATHS.workspace)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('lets an owner through', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .get(PATHS.workspace)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });
});
