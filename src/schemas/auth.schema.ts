import { z } from 'zod';
import { emailSchema, signupRoleSchema } from './common';

export const signupWithEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(36),
  role: signupRoleSchema.default('customer'),
});

export const loginWithEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
