import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ERROR_CODES } from '../i18n';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate: RequestHandler = async (req, _, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing.', ERROR_CODES.AUTH_TOKEN_MISSING);
  }

  const token = authorizationHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Authentication token is missing.', ERROR_CODES.AUTH_TOKEN_MISSING);
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    throw new UnauthorizedError('Authentication token is invalid.', ERROR_CODES.AUTH_TOKEN_INVALID);
  }

  next();
};
