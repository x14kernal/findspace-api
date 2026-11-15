import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class UnsupportedMediaTypeError extends AppError {
  constructor(
    message = 'The file type is not supported.',
    code: ErrorCode = ERROR_CODES.FILE_TYPE_NOT_SUPPORTED,
  ) {
    super(message, code, 415);
    this.name = ERROR_CODES.FILE_TYPE_NOT_SUPPORTED;
  }
}
