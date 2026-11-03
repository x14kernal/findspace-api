import { type ErrorCode } from '../i18n';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APP_ERROR';
  }
}
