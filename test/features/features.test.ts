import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { PATHS } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { addRoom, addWorkspace, authed, cleanup, loginUser } from '../helpers';
import { redis } from '../../src/database/redis';

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

type FeatureItem = { id: string; name: string; slug: string };

// owner + workspace + one room
const ownerWithRoom = async () => {
  const { accessToken } = await loginUser('owner');
  await addWorkspace(accessToken);
  const room = await addRoom(accessToken);
  return { accessToken, roomId: room.id as string };
};

// the first n feature ids from the public list
const getFeatureIds = async (n: number) => {
  const res = await request(app).get(PATHS.features);
  return (res.body.data as FeatureItem[]).slice(0, n).map((f) => f.id);
};

const putFeatures = (token: string, roomId: string, features: object[]) =>
  authed('put', PATHS.roomFeatures(roomId), token).send({ features });

describe('GET /features', () => {
  it('returns the list without a token', async () => {
    const res = await request(app).get(PATHS.features);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.FEATURES_FETCHED);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
      }),
    );
  });

  it('returns the list sorted by name', async () => {
    const res = await request(app).get(PATHS.features);
    const names = (res.body.data as FeatureItem[]).map((f) => f.name);
    const sorted = [...names].sort();

    expect(names).toEqual(sorted);
  });
});

describe('PUT /owner/rooms/:roomId/features', () => {
  it('returns 401 without a token', async () => {
    const res = await authed('put', PATHS.roomFeatures(randomUUID()), '').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_TOKEN_MISSING);
  });

  it('returns 403 for a customer', async () => {
    const { accessToken } = await loginUser();
    const res = await authed('put', PATHS.roomFeatures(randomUUID()), accessToken).send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN_ERROR);
  });

  it('returns 404 for another owner room', async () => {
    const a = await ownerWithRoom();
    const b = await loginUser('owner');
    await addWorkspace(b.accessToken);

    const res = await putFeatures(b.accessToken, a.roomId, []);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.ROOM_NOT_FOUND);
  });

  it('returns 400 for a feature that does not exist', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const res = await putFeatures(accessToken, roomId, [{ featureId: randomUUID() }]);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.FEATURE_NOT_FOUND);
  });

  it('keeps the old features when one id does not exist', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const [id1] = await getFeatureIds(1);

    await putFeatures(accessToken, roomId, [{ featureId: id1 }]);
    const bad = await putFeatures(accessToken, roomId, [
      { featureId: id1 },
      { featureId: randomUUID() },
    ]);
    const same = await putFeatures(accessToken, roomId, [{ featureId: id1 }]);

    expect(bad.statusCode).toBe(400);
    expect(same.body.data.features).toHaveLength(1);
  });

  it('returns 200 with the features and the details', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const [id1, id2] = await getFeatureIds(2);

    const res = await putFeatures(accessToken, roomId, [
      { featureId: id1, featureDetails: '100 Mbps' },
      { featureId: id2 },
    ]);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.ROOM_FEATURES_UPDATED);

    const items = res.body.data.features as {
      featureId: string;
      name: string;
      slug: string;
      featureDetails: string | null;
    }[];
    expect(items.map((i) => i.featureId).sort()).toEqual([id1, id2].sort());
    expect(items.find((i) => i.featureId === id1)?.featureDetails).toBe('100 Mbps');
    expect(items.find((i) => i.featureId === id2)?.featureDetails).toBeNull();
    expect(items[0]).toEqual(
      expect.objectContaining({ name: expect.any(String), slug: expect.any(String) }),
    );
  });

  it('replaces the old features, and [] removes all', async () => {
    const { accessToken, roomId } = await ownerWithRoom();
    const [id1, id2, id3] = await getFeatureIds(3);

    await putFeatures(accessToken, roomId, [{ featureId: id1 }, { featureId: id2 }]);
    const second = await putFeatures(accessToken, roomId, [{ featureId: id3 }]);
    const cleared = await putFeatures(accessToken, roomId, []);

    expect(second.body.data.features.map((f: { featureId: string }) => f.featureId)).toEqual([id3]);
    expect(cleared.statusCode).toBe(200);
    expect(cleared.body.data.features).toEqual([]);
  });
});
