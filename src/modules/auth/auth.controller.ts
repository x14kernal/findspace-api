import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendSuccessWithoutData } from '../../responses/response-helpers';
import { ERROR_CODES, SUCCESS_CODES } from '../../i18n';
import { REFRESH_COOKIE, refreshCookieOptions } from '../../utils/cookies';
import { UnauthorizedError } from '../../errors/unauthorized.error';

export const authController = {
  async signup(req: Request, res: Response) {
    const data = await authService.signup(req.body);
    sendSuccess(res, data, { status: 201, code: SUCCESS_CODES.AUTH_SIGNUP_SUCCESS });
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    sendSuccess(res, { user, accessToken }, { code: SUCCESS_CODES.AUTH_LOGIN_SUCCESS });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError(
        'Refresh token is not valid.',
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID,
      );
    }

    try {
      const { accessToken, refreshToken } = await authService.refresh(token);
      res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
      sendSuccess(res, { accessToken });
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
      throw err;
    }
  },

  async googleAuth(req: Request, res: Response) {
    const { user, accessToken, refreshToken, isNewUser } = await authService.authenticateWithGoogle(
      req.body,
    );
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);

    sendSuccess(
      res,
      { user, accessToken },
      isNewUser
        ? { status: 201, code: SUCCESS_CODES.AUTH_SIGNUP_SUCCESS }
        : { status: 200, code: SUCCESS_CODES.AUTH_LOGIN_SUCCESS },
    );
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (typeof token === 'string' && token) await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    return sendSuccessWithoutData(res, { code: SUCCESS_CODES.AUTH_LOGOUT_SUCCESS });
  },
};
