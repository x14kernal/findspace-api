import { z } from 'zod';
import type { loginWithEmailSchema, signupWithEmailSchema } from '../schemas/auth.schema';
import type { UserResponse } from './user.types';

export type SignupWithEmail = z.infer<typeof signupWithEmailSchema>;
export type LoginWithEmail = z.infer<typeof loginWithEmailSchema>;

export type LoginResponse = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};
