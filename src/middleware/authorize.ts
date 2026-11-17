import type { RequestHandler } from 'express';
import { ForbiddenError } from '../errors/forbidden.error';
import type { Role } from '../types/user.types';

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req, _, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    throw new ForbiddenError();
  };
};
