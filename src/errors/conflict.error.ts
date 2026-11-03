import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists.', code: ErrorCode = ERROR_CODES.CONFLICT_ERROR) {
    super(message, code, 409);
    this.name = ERROR_CODES.CONFLICT_ERROR;
  }
}
