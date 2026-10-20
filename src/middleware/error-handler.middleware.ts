import type { ErrorRequestHandler } from 'express';
import { sendError } from '../responses/response-helpers.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Request failed', { requestId: res.locals.requestId, error });

  return sendError(
    res,
    { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    500,
  );
};
