export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  prev: string | null;
  next: string | null;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: null;
};

export type ApiSuccessWithMeta<T, P = PaginationMeta> = {
  success: true;
  data: T;
  meta: P;
};

export type ApiErrorDetails = {
  field: string;
  code: string; // Must be from error codes list, let it string for now
  message: string;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code: string; // Must be from error codes list, let it string for now
    details: ApiErrorDetails[] | null;
    requestId: string | null;
  };
};

export type ApiResponse<T, P = PaginationMeta> = ApiSuccess<T> | ApiSuccessWithMeta<T, P> | ApiError;
