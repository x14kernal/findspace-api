import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ERROR_CODES } from '../../i18n';
import { env } from '../../config/env';

type GoogleProfile = {
  googleId: string;
  email: string;
};

const client = new OAuth2Client();

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  let ticket;

  try {
    ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  } catch {
    throw new UnauthorizedError('Invalid Google token.', ERROR_CODES.AUTH_GOOGLE_TOKEN_INVALID);
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError('Invalid Google token.', ERROR_CODES.AUTH_GOOGLE_TOKEN_INVALID);
  }

  if (payload.email_verified !== true) {
    throw new UnauthorizedError(
      'Google email is not verified.',
      ERROR_CODES.AUTH_GOOGLE_EMAIL_NOT_VERIFIED,
    );
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
  };
}
