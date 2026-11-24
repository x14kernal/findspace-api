import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { redis } from '../../src/database/redis';
import { addRoom, addWorkspace, cleanup, loginUser, validRoomBody } from '../helpers';
import app from '../../src/app';
import request from 'supertest';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { CREATE_ROOM_PATH, GET_ROOM_PATH, GET_ROOMS_PATH } from '../constants';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('GET /owner/rooms', () => {
  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .get(GET_ROOMS_PATH)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns only my rooms', async () => {
    const a = await loginUser('owner');
    const b = await loginUser('owner');
    await addWorkspace(a.accessToken);
    await addWorkspace(b.accessToken);
    await addRoom(a.accessToken, { code: 'A-1' });
    await addRoom(a.accessToken, { code: 'A-2' });
    await addRoom(b.accessToken, { code: 'B-1' });

    const res = await request(app)
      .get(GET_ROOMS_PATH)
      .set('Authorization', `Bearer ${a.accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOMS_FETCHED);
    expect(res.body.data.map((r: { code: string }) => r.code)).toEqual(['A-1', 'A-2']);
  });
});

describe('GET /owner/rooms/:roomId', () => {
  it('returns 200 for my room', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const room = await addRoom(accessToken);

    const res = await request(app)
      .get(`${GET_ROOM_PATH}/${room.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_FETCHED);
    expect(res.body.data).toEqual(room);
  });

  it('returns 404 for another owner room', async () => {
    const a = await loginUser('owner');
    const b = await loginUser('owner');
    await addWorkspace(a.accessToken);
    await addWorkspace(b.accessToken);
    const room = await addRoom(a.accessToken);

    const res = await request(app)
      .get(`${GET_ROOM_PATH}/${room.id}`)
      .set('Authorization', `Bearer ${b.accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 400 for a bad uuid', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .get(`${GET_ROOM_PATH}/abc`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});

describe('POST /owner/rooms', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post(CREATE_ROOM_PATH).set('Authorization', 'Bearer ').send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validRoomBody());

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns 400 when `floorNumber` is above the workspace `floorCount`', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken); // defualt floorCount is 3

    const res = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validRoomBody({ floorNumber: 4 }));

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_FLOOR_EXCEEDS_WORKSPACE);
  });

  it('returns 409 when the same `code` is sent twice', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const r1 = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validRoomBody({ code: 'R-1' }));

    const r2 = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(validRoomBody({ code: 'R-1' }));

    expect(r1.statusCode).toBe(201);
    expect(r1.body.code).toBe(SUCCESS_CODES.ROOM_CREATED);

    expect(r2.statusCode).toBe(409);
    expect(r2.body.error.code).toBe(ERROR_CODES.ROOM_CODE_ALREADY_EXISTS);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 201 on success', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const res = await request(app)
      .post(CREATE_ROOM_PATH)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(
        validRoomBody({
          name: 'stars',
          description: 'your dream space to achieve your dreams',
          code: 'R-1',
          pricePerHour: '152.50',
        }),
      );

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_CREATED);
    expect(res.body.data.pricePerHour).toBe('152.50');
    expect(res.body.data.code).toBe('R-1');
    expect(res.body.data).not.toHaveProperty('workspaceId');
  });
});
