import type { ErrorRequestHandler } from 'express';
import { sendError } from '../responses/response-helpers.js';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error.js';
import { ERROR_CODES } from '../i18n';
import { toFieldErrorCode } from '../errors/error-mapper.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // console.log('Request failed', { requestId: res.locals.requestId, err: err.message });

  // For Validation Errors
  if (err instanceof ZodError) {
    const details = err.issues.map(({ path, code, message }) => ({
      field: path.join('.'),
      code: toFieldErrorCode(code),
      message,
    }));
    return sendError(
      res,
      { code: ERROR_CODES.VALIDATION_ERROR, message: 'Invalid request data', details },
      400,
    );
  }

  // For Thrown app's errors
  if (err instanceof AppError) {
    return sendError(res, { code: err.code, message: err.message }, err.statusCode);
  }

  // For Invalid JOSN error
  if (err?.type === 'entity.parse.failed') {
    return sendError(
      res,
      { code: ERROR_CODES.INVALID_JSON_ERROR, message: 'Invalid JSON body' },
      400,
    );
  }

  // For the rest
  return sendError(res, { code: ERROR_CODES.INTERNAL_ERROR, message: 'Something went wrong' }, 500);
};
