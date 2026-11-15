import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class PayloadTooLargeError extends AppError {
  constructor(
    message = 'The payload is too large',
    code: ErrorCode = ERROR_CODES.PAYLOAD_TOO_LARGE_ERROR,
  ) {
    super(message, code, 413);
    this.name = ERROR_CODES.PAYLOAD_TOO_LARGE_ERROR;
  }
}
