import type { Response } from 'express';
import type {
  ApiError,
  ApiErrorDetails,
  ApiSuccess,
  ApiSuccessWithMeta,
} from '../types/common/api.types';
import type { ErrorCode, SuccessCode } from '../i18n';

type SuccessOptions = { status?: number; code?: SuccessCode };

export function sendSuccess<T>(
  res: Response,
  data: T,
  { status = 200, code }: SuccessOptions = {},
): Response<ApiSuccess<T>> {
  return res.status(status).json({
    success: true,
    code: code ?? null,
    data,
    meta: null,
  });
}

export function sendSuccessWithMeta<T, M>(
  res: Response,
  data: T,
  meta: M,
  { status = 200, code }: SuccessOptions = {},
): Response<ApiSuccessWithMeta<T, M>> {
  return res.status(status).json({
    success: true,
    code: code ?? null,
    data,
    meta,
  });
}

export function sendSuccessWithoutData(res: Response, options: SuccessOptions = {}) {
  return sendSuccess(res, null, options);
}

export function sendError(
  res: Response,
  error: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetails[];
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
