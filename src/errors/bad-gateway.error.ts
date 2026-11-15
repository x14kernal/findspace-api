import { ERROR_CODES, type ErrorCode } from '../i18n';
import { AppError } from './app.error';

export class BadGatewayError extends AppError {
  constructor(message = '502 Bad Gateway.', code: ErrorCode = ERROR_CODES.BAD_GATEWAY_ERROR) {
    super(message, code, 502);
    this.name = ERROR_CODES.BAD_GATEWAY_ERROR;
  }
}
