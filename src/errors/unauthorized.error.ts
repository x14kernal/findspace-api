import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class UnauthorizedError extends AppError {
  constructor(
    message = 'You are not allowed to do this.',
    code: ErrorCode = ERROR_CODES.UNAUTHORIZED_ERROR,
  ) {
    super(message, code, 401);
    this.name = ERROR_CODES.UNAUTHORIZED_ERROR;
  }
}
