import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestIdMiddleware: RequestHandler = (_req, res, next) => {
  const requestId = randomUUID();

  /*
   * Use res.locals so a later middleware can access the same ID
   * The data is intended for the current request-response cycle, not persistent storage.
   */
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};
