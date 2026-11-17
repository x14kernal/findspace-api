import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: ErrorCode = ERROR_CODES.FORBIDDEN_ERROR) {
    super(message, code, 403);
    this.name = ERROR_CODES.FORBIDDEN_ERROR;
  }
}
