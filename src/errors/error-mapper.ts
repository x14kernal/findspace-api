import type { ZodError } from 'zod';
import { FIELD_ERROR_CODES, type FieldErrorCode } from '../i18n';

type ZodIssueCode = ZodError['issues'][number]['code'];

const ZOD_TO_FIELD_CODE: Record<ZodIssueCode, FieldErrorCode> = {
  invalid_type: FIELD_ERROR_CODES.INVALID_TYPE,
  too_small: FIELD_ERROR_CODES.TOO_SMALL,
  too_big: FIELD_ERROR_CODES.TOO_BIG,
  invalid_format: FIELD_ERROR_CODES.INVALID_FORMAT,
  invalid_value: FIELD_ERROR_CODES.INVALID_VALUE,
  not_multiple_of: FIELD_ERROR_CODES.INVALID,
  unrecognized_keys: FIELD_ERROR_CODES.INVALID,
  invalid_union: FIELD_ERROR_CODES.INVALID,
  invalid_key: FIELD_ERROR_CODES.INVALID,
  invalid_element: FIELD_ERROR_CODES.INVALID,
  custom: FIELD_ERROR_CODES.INVALID,
};

export const toFieldErrorCode = (code: ZodIssueCode): FieldErrorCode => ZOD_TO_FIELD_CODE[code];
