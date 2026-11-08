import { z } from 'zod';
import type {
  googleAuthSchema,
  loginWithEmailSchema,
  signupWithEmailSchema,
} from '../schemas/auth.schema';
import type { UserResponse } from './user.types';

export type SignupWithEmail = z.infer<typeof signupWithEmailSchema>;
export type LoginWithEmail = z.infer<typeof loginWithEmailSchema>;

export type LoginResponse = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};

export type GoogleAuth = z.infer<typeof googleAuthSchema>;

export type GoogleAuthResponse = LoginResponse & {
  isNewUser: boolean;
};
