import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class NotFoundError extends AppError {
  constructor(
    message: string = 'The requested resource not found',
    code: ErrorCode = ERROR_CODES.NOT_FOUND_ERROR,
  ) {
    super(message, code, 404);
    this.name = ERROR_CODES.NOT_FOUND_ERROR;
  }
}
