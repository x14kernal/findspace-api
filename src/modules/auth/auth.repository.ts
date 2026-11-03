import { redis } from '../../database/redis';

const rKey = (tokenHash: string) => `refresh:${tokenHash}`;
const fKey = (familyId: string) => `family:${familyId}`;

type SaveTokenParams = {
  tokenHash: string;
  userId: string;
  familyId: string;
  ttlSeconds: number;
};

export const authRepository = {
  async saveToken({ tokenHash, userId, familyId, ttlSeconds }: SaveTokenParams) {
    await redis
      .multi()
      .hSet(rKey(tokenHash), { userId, familyId, status: 'valid' })
      .expire(rKey(tokenHash), ttlSeconds)
      .setEx(fKey(familyId), ttlSeconds, tokenHash)
      .exec();
  },

  async findToken(tokenHash: string) {
    const data = await redis.hGetAll(rKey(tokenHash));
    if (!data.userId || !data.familyId || !data.status) return null;
    return {
      userId: data.userId,
      familyId: data.familyId,
      status: data.status as 'valid' | 'used',
    };
  },

  async markUsed(tokenHash: string) {
    await redis.hSet(rKey(tokenHash), 'status', 'used');
  },

  getFamilyToken(familyId: string): Promise<string | null> {
    return redis.get(fKey(familyId));
  },

  async deleteFamily(familyId: string) {
    const currentToken = await redis.get(fKey(familyId));
    const keys = currentToken ? [rKey(currentToken), fKey(familyId)] : [fKey(familyId)];
    await redis.del(keys);
  },
};
