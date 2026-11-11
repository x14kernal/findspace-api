import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class BadRequestError extends AppError {
  constructor(
    message = 'The request is not valid.',
    code: ErrorCode = ERROR_CODES.BAD_REQUEST_ERROR,
  ) {
    super(message, code, 400);
    this.name = ERROR_CODES.BAD_REQUEST_ERROR;
  }
}
