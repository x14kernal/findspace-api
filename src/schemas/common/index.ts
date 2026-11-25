import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const signupRoleSchema = z.enum(['customer', 'owner']);
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const positiveDecimalString = (maxIntDigits: number) =>
  z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{1,${maxIntDigits}}(\\.\\d{1,2})?$`))
    .refine((v) => Number(v) > 0);
