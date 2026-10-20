import type { Response } from 'express';
import type { ApiError, ApiErrorDetails, ApiSuccess, ApiSuccessWithMeta } from '../schemas/common/api.schema.js';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response<ApiSuccess<T>> {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: null,
  });
}

export function sendSuccessWithMeta<T, M>(
  res: Response,
  data: T,
  meta: M,
  statusCode = 200,
): Response<ApiSuccessWithMeta<T, M>> {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
}

export function sendSuccessWithoutData(res: Response) {
  return sendSuccess(res, null);
}

export function sendError(
  res: Response,
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetails;
  },
  status: number,
): Response<ApiError> {
  return res.status(status).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details ?? null,
      requestId: res.locals.requestId ?? null,
    },
  });
}
