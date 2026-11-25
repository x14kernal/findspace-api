import { afterAll, beforeAll, expect, it } from 'vitest';
import { authRepository } from '../../src/modules/auth/auth.repository';
import { generateRefreshToken, hashToken } from '../../src/utils/refresh-token';
import { env } from '../../src/config/env';
import { redis } from '../../src/database/redis';

const fromDaysToSecs = (day: number) => day * 24 * 60 * 60;

beforeAll(() => redis.connect());
afterAll(async () => {
  await redis.quit();
});

it('saves, finds and removes a token', async () => {
  const tokenHash = hashToken(generateRefreshToken());

  await authRepository.saveToken({
    tokenHash,
    userId: '14',
    familyId: '1000',
    ttlSeconds: fromDaysToSecs(env.REFRESH_TOKEN_TTL_DAYS),
  });

  const tokenData = await authRepository.findToken(tokenHash);

  if (tokenData) {
    expect(tokenData).toMatchObject({ userId: '14', familyId: '1000', status: 'valid' });
    await authRepository.deleteFamily(tokenData.familyId);
  }

  expect(await authRepository.findToken(tokenHash)).toBeNull();
});
