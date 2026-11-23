import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const signupRoleSchema = z.enum(['customer', 'owner']);
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
