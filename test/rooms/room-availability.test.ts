import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GET_ROOM_AVAILABILITY_PATH, REPLACE_WORKSPACE_AVAILABILITY_PATH } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import {
  addRoom,
  addWorkspace,
  authed,
  cleanup,
  loginUser,
  validAvailabilityBody,
} from '../helpers';
import { redis } from '../../src/database/redis';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
}, 30000);

const roomAvailabilityPath = (roomId: string) =>
  `${GET_ROOM_AVAILABILITY_PATH}/${roomId}/availability`;

// owner + workspace open Monday and Tuesday 09:00-17:00 (the default body) + one room
const ownerWithRoom = async () => {
  const { accessToken } = await loginUser('owner');
  await addWorkspace(accessToken);
  await authed('put', REPLACE_WORKSPACE_AVAILABILITY_PATH, accessToken).send(
    validAvailabilityBody(),
  );
  const room = await addRoom(accessToken);
  return { accessToken, roomId: room.id as string };
};

const put = (token: string, roomId: string, availabilities: object[]) =>
  authed('put', roomAvailabilityPath(roomId), token).send({ availabilities });

describe('GET /owner/rooms/:roomId/availability', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('get', roomAvailabilityPath(randomUUID()), '');

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('get', roomAvailabilityPath(randomUUID()), accessToken);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for an owner with no workspace', async () => {
    const { accessToken } = await loginUser('owner');
    const res = await authed('get', roomAvailabilityPath(randomUUID()), accessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.WORKSPACE_NOT_FOUND);
  });

  it('returns 404 for another owner room', async () => {
    const a = await ownerWithRoom();
    const b = await loginUser('owner');
    await addWorkspace(b.accessToken);

    const res = await authed('get', roomAvailabilityPath(a.roomId), b.accessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 200 with an empty list for a new room', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await authed('get', roomAvailabilityPath(roomId), accessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_AVAILABILITY_FETCHED);
    expect(res.body.data).toEqual({ availabilities: [] });
  });
});

describe('PUT /owner/rooms/:roomId/availability', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('put', roomAvailabilityPath(randomUUID()), '').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('put', roomAvailabilityPath(randomUUID()), accessToken).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for another owner room', async () => {
    const a = await ownerWithRoom();
    const b = await loginUser('owner');
    await addWorkspace(b.accessToken);

    const res = await put(b.accessToken, a.roomId, []);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 400 for hours outside the workspace hours', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await put(accessToken, roomId, [
      { dayOfWeek: '1', startAt: '08:00', endAt: '14:00' },
    ]);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_AVAILABILITY_OUTSIDE_WORKSPACE_HOURS);
  });

  it('returns 400 for a day the workspace is closed', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await put(accessToken, roomId, [
      { dayOfWeek: '3', startAt: '10:00', endAt: '14:00' },
    ]);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_AVAILABILITY_OUTSIDE_WORKSPACE_DAYS);
  });

  it('returns 200 for exactly the workspace hours', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await put(accessToken, roomId, [
      { dayOfWeek: '1', startAt: '09:00', endAt: '17:00' },
    ]);

    expect(res.statusCode).toBe(200);
  });

  it('replaces the hours, and [] makes the room inherit again', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const payload = [{ dayOfWeek: '1', startAt: '10:00', endAt: '14:00' }];

    const put1 = await put(accessToken, roomId, payload);
    const get1 = await authed('get', roomAvailabilityPath(roomId), accessToken);
    const put2 = await put(accessToken, roomId, []);
    const get2 = await authed('get', roomAvailabilityPath(roomId), accessToken);

    expect(put1.statusCode).toBe(200);
    expect(put1.body.code).toBe(SUCCESS_CODES.ROOM_AVAILABILITY_UPDATED);
    expect(put1.body.data.availabilities).toEqual(payload);
    expect(get1.body.data.availabilities).toEqual(payload);

    expect(put2.statusCode).toBe(200);
    expect(put2.body.data.availabilities).toEqual([]);
    expect(get2.body.data.availabilities).toEqual([]);
  });
});
