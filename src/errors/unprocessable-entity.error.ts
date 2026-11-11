import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class UnprocessableEntityError extends AppError {
  constructor(
    message = 'The data you sent cannot be processed.',
    code: ErrorCode = ERROR_CODES.UNPROCESSABLE_ENTITY_ERROR,
  ) {
    super(message, code, 422);
    this.name = ERROR_CODES.UNPROCESSABLE_ENTITY_ERROR;
  }
}
