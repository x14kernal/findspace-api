import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { redis } from '../../src/database/redis';
import { addRoom, addWorkspace, authed, cleanup, loginUser, validRoomBody } from '../helpers';
import app from '../../src/app';
import request from 'supertest';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { PATHS } from '../constants';

beforeAll(() => redis.connect());
afterAll(async () => {
  console.log('Starting cleanup...');
  await cleanup();
  console.log('Cleanup completed. Closing Redis...');
  await redis.quit();
  console.log('Redis disconnected.');
}, 30000);

describe('GET /owner/rooms', () => {
  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app).get(PATHS.rooms).set('Authorization', `Bearer ${accessToken}`);

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

    const res = await request(app).get(PATHS.rooms).set('Authorization', `Bearer ${a.accessToken}`);

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
      .get(PATHS.room(room.id))
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
      .get(PATHS.room(room.id))
      .set('Authorization', `Bearer ${b.accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 400 for a bad uuid', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await request(app)
      .get(PATHS.room('abc'))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});

describe('POST /owner/rooms', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('post', PATHS.rooms, '').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('post', PATHS.rooms, accessToken).send(validRoomBody());

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns 400 when `floorNumber` is above the workspace `floorCount`', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken); // defualt floorCount is 3
    const res = await authed('post', PATHS.rooms, accessToken).send(
      validRoomBody({ floorNumber: 4 }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_FLOOR_EXCEEDS_WORKSPACE);
  });

  it('returns 409 when the same `code` is sent twice', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const r1 = await authed('post', PATHS.rooms, accessToken).send(validRoomBody({ code: 'R-1' }));
    const r2 = await authed('post', PATHS.rooms, accessToken).send(validRoomBody({ code: 'R-1' }));

    expect(r1.statusCode).toBe(201);
    expect(r1.body.code).toBe(SUCCESS_CODES.ROOM_CREATED);

    expect(r2.statusCode).toBe(409);
    expect(r2.body.error.code).toBe(ERROR_CODES.ROOM_CODE_ALREADY_EXISTS);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('post', PATHS.rooms, accessToken).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 201 on success', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const res = await authed('post', PATHS.rooms, accessToken).send(
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

const patchRoom = (token: string, roomId: string, body: object) =>
  authed('patch', PATHS.room(roomId), token).send(body);

describe('PATCH /owner/rooms/:roomId', () => {
  it('returns 200 and changes only the sent field', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const room = await addRoom(accessToken, { code: 'R-1', pricePerHour: '150.00' });
    const res = await patchRoom(accessToken, room.id, { name: 'New name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_UPDATED);
    expect(res.body.data.name).toBe('New name');
    expect(res.body.data.code).toBe('R-1');
    expect(res.body.data.pricePerHour).toBe('150.00');
  });

  it('returns the same room for {}', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const room = await addRoom(accessToken);
    const res = await patchRoom(accessToken, room.id, {});

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(room);
  });

  it('allows sending the room own code again', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const room = await addRoom(accessToken, { code: 'R-1' });
    const res = await patchRoom(accessToken, room.id, { code: 'R-1' });

    expect(res.statusCode).toBe(200);
  });

  it('returns 409 for the code of another room', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    await addRoom(accessToken, { code: 'R-1' });
    const second = await addRoom(accessToken, { code: 'R-2' });

    const res = await patchRoom(accessToken, second.id, { code: 'R-1' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_CODE_ALREADY_EXISTS);
  });

  it('returns 400 when floorNumber is above the workspace floorCount', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken); // floorCount is 3
    const room = await addRoom(accessToken);

    const res = await patchRoom(accessToken, room.id, { floorNumber: 4 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_FLOOR_EXCEEDS_WORKSPACE);
  });

  it('returns 404 for another owner room', async () => {
    const a = await loginUser('owner');
    const b = await loginUser('owner');
    await addWorkspace(a.accessToken);
    await addWorkspace(b.accessToken);
    const room = await addRoom(a.accessToken);

    const res = await patchRoom(b.accessToken, room.id, { name: 'Hacked' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });
});

const deleteRoom = (token: string, roomId: string) =>
  authed('delete', PATHS.room(roomId), token).set('Authorization', `Bearer ${token}`);

const getRoom = (token: string, roomId: string) =>
  request(app).get(PATHS.room(roomId)).set('Authorization', `Bearer ${token}`);

describe('DELETE /owner/rooms/:roomId', () => {
  it('returns 200 and the room is gone', async () => {
    const { accessToken } = await loginUser('owner');
    await addWorkspace(accessToken);
    const room = await addRoom(accessToken);

    const res = await deleteRoom(accessToken, room.id);
    const after = await getRoom(accessToken, room.id);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_DELETED);
    expect(after.statusCode).toBe(404);
  });

  it('returns 404 for another owner room and keeps it', async () => {
    const a = await loginUser('owner');
    const b = await loginUser('owner');
    await addWorkspace(a.accessToken);
    await addWorkspace(b.accessToken);
    const room = await addRoom(a.accessToken);

    const res = await deleteRoom(b.accessToken, room.id);
    const after = await getRoom(a.accessToken, room.id);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
    expect(after.statusCode).toBe(200);
  });
});
