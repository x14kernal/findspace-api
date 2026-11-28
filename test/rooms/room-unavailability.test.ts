import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PATHS } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import {
  addRoom,
  addUnavailability,
  addWorkspace,
  authed,
  cleanup,
  loginUser,
  ownerWithRoom,
} from '../helpers';
import { redis } from '../../src/database/redis';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
}, 30000);

describe('POST /owner/rooms/:roomId/unavailability', () => {
  it('returns 404 for another owner room', async () => {
    const a = await ownerWithRoom();
    const b = await loginUser('owner');
    await addWorkspace(b.accessToken);

    const res = await addUnavailability(b.accessToken, a.roomId);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 201 with id, reason and HH:mm times', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await addUnavailability(accessToken, roomId, { reason: 'Repair' });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_UNAVAILABILITY_CREATED);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      dayDate: '2099-01-01',
      startAt: '10:00',
      endAt: '12:00',
      reason: 'Repair',
    });
  });

  it('returns 400 for a past date', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await addUnavailability(accessToken, roomId, { dayDate: '2000-01-01' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_UNAVAILABILITY_IN_PAST);
  });

  it('returns 409 for an overlap', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    await addUnavailability(accessToken, roomId); // 10:00-12:00
    const res = await addUnavailability(accessToken, roomId, { startAt: '11:00', endAt: '13:00' });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_UNAVAILABILITY_OVERLAPS);
  });

  it('returns 201 for touching times', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    await addUnavailability(accessToken, roomId); // 10:00-12:00
    const res = await addUnavailability(accessToken, roomId, { startAt: '12:00', endAt: '14:00' });

    expect(res.statusCode).toBe(201);
  });

  it('returns 201 for the same time on another date', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    await addUnavailability(accessToken, roomId);
    const res = await addUnavailability(accessToken, roomId, { dayDate: '2099-01-02' });

    expect(res.statusCode).toBe(201);
  });
});

describe('GET /owner/rooms/:roomId/unavailability', () => {
  it('returns only this room rows, in order', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const other = await addRoom(accessToken, { code: 'R-2' });

    await addUnavailability(accessToken, roomId, { dayDate: '2099-01-02' });
    await addUnavailability(accessToken, roomId, { startAt: '14:00', endAt: '16:00' });
    await addUnavailability(accessToken, roomId);
    await addUnavailability(accessToken, other.id); // another room

    const res = await authed('get', PATHS.roomUnavailability(roomId), accessToken);
    const rows = res.body.data.unavailabilities as { dayDate: string; startAt: string }[];

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_UNAVAILABILITIES_FETCHED);
    expect(rows.map((r) => `${r.dayDate} ${r.startAt}`)).toEqual([
      '2099-01-01 10:00',
      '2099-01-01 14:00',
      '2099-01-02 10:00',
    ]);
  });
});

describe('DELETE /owner/rooms/:roomId/unavailability/:unavailabilityId', () => {
  it('returns 200 and the row is gone', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const created = await addUnavailability(accessToken, roomId);
    const id = created.body.data.id as string;

    const res = await authed('delete', PATHS.roomUnavailabilityItem(roomId, id), accessToken);
    const list = await authed('get', PATHS.roomUnavailability(roomId), accessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_UNAVAILABILITY_DELETED);
    expect(list.body.data.unavailabilities).toEqual([]);
  });

  it('returns 404 for another owner room', async () => {
    const a = await ownerWithRoom();
    const b = await loginUser('owner');
    await addWorkspace(b.accessToken);
    const created = await addUnavailability(a.accessToken, a.roomId);
    const id = created.body.data.id as string;

    const res = await authed('delete', PATHS.roomUnavailabilityItem(a.roomId, id), b.accessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 404 for a blocked time of another room of the same owner', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const other = await addRoom(accessToken, { code: 'R-2' });
    const created = await addUnavailability(accessToken, roomId);
    const id = created.body.data.id as string;

    const res = await authed('delete', PATHS.roomUnavailabilityItem(other.id, id), accessToken);
    const still = await authed('get', PATHS.roomUnavailability(roomId), accessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_UNAVAILABILITY_NOT_FOUND);
    expect(still.body.data.unavailabilities).toHaveLength(1);
  });
});
