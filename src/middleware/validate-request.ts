import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export function validateRequest(
  schema: ZodType,
  source: 'body' | 'query' | 'params' = 'body',
): RequestHandler {
  return (req, res, next) => {
    const result = schema.parse(req[source]);
    if (source === 'body') req[source] = result;
    else res.locals[source] = result;
    next();
  };
}
