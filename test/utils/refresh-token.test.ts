import { describe, expect, it } from 'vitest';
import { generateRefreshToken, hashToken } from '../../src/utils/refresh-token';

describe('refresh token', () => {
  it('generates a different token each time', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });

  it('gives the same hash for the same token', () => {
    const token = generateRefreshToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('hash is not the token and has 64 characters', () => {
    const token = generateRefreshToken();
    const hash = hashToken(token);
    expect(hash).not.toBe(token);
    expect(hash).toHaveLength(64);
  });
});
