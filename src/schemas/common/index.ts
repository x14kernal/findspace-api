import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const signupRoleSchema = z.enum(['customer', 'owner']);
