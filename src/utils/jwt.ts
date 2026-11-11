import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { env } from '../config/env';
import type { Role } from '../types/user.types';

interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: Role;
}

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export function signAccessToken(user: { id: string; role: Role }): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  return payload as AccessTokenPayload;
}
