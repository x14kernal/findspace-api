import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE = 'refreshToken';

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/auth',
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};
