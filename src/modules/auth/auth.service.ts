import type { LoginResponse, LoginWithEmail, SignupWithEmail } from '../../types/auth.types';
import type { UserResponse } from '../../types/user.types';

import { ConflictError } from '../../errors/conflict.error';
import { hashPassword, isPasswordCorrect } from '../../utils/password';
import { toUserResponse } from '../users/users.mapper';
import { usersService } from '../users/users.service';
import { ERROR_CODES } from '../../i18n';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { env } from '../../config/env';
import { signAccessToken } from '../../utils/jwt';
import { generateRefreshToken, hashToken } from '../../utils/refresh-token';
import { authRepository } from './auth.repository';
import { randomUUID } from 'node:crypto';

const REFRESH_TTL_SECONDS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;

export const authService = {
  // Signup
  async signup({ email, password, role }: SignupWithEmail): Promise<UserResponse> {
    const isEmailExist = await usersService.isEmailExist(email);
    if (isEmailExist)
      throw new ConflictError('Email is already in use.', ERROR_CODES.AUTH_EMAIL_TAKEN);

    const passwordHash = await hashPassword(password);
    const user = await usersService.create({ email, role, passwordHash });
    return toUserResponse(user);
  },

  // Login
  async login({ email, password }: LoginWithEmail): Promise<LoginResponse> {
    const user = await usersService.findByEmail(email);
    const isValid = user?.passwordHash && (await isPasswordCorrect(password, user.passwordHash));

    if (!user || !isValid) {
      throw new UnauthorizedError(
        'Credentials are not valid.',
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      );
    }

    const accessToken = await signAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken();

    await authRepository.saveToken({
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      familyId: randomUUID(),
      ttlSeconds: REFRESH_TTL_SECONDS,
    });

    return { user: toUserResponse(user), accessToken, refreshToken };
  },

  // Refresh token
  async refresh(token: string) {
    const tokenHash = hashToken(token);

    const data = await authRepository.findToken(tokenHash);
    if (!data) {
      throw new UnauthorizedError(
        'Refresh token is not valid.',
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID,
      );
    }

    if (data.status === 'used') {
      await authRepository.deleteFamily(data.familyId);
      throw new UnauthorizedError(
        'Refresh token is not valid.',
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID,
      );
    }

    const user = await usersService.findById(data.userId);
    if (!user) {
      throw new UnauthorizedError(
        'Refresh token is not valid.',
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID,
      );
    }

    await authRepository.markUsed(tokenHash);

    const accessToken = await signAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken();

    await authRepository.saveToken({
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      familyId: data.familyId,
      ttlSeconds: REFRESH_TTL_SECONDS,
    });

    return { accessToken, refreshToken };
  },

  // Logout
  async logout(token: string) {
    const data = await authRepository.findToken(hashToken(token));
    if (!data) return;
    await authRepository.deleteFamily(data.familyId);
  },
};
