import { decodeJwt } from 'jose';
import { expect, it } from 'vitest';
import { signAccessToken } from '../../src/utils/jwt';

it('creates a token with sub and role', async () => {
  const token = await signAccessToken({ id: 'user-1', role: 'customer' });
  const payload = decodeJwt(token);

  expect(payload.sub).toBe('user-1');
  expect(payload.role).toBe('customer');
  expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
});
