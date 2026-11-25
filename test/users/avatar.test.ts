import { afterAll, beforeAll, beforeEach, vi, describe, expect, it } from 'vitest';
import { redis } from '../../src/database/redis';
import { authed, cleanup, loginUser, makePng, uploadAvatar, userWithProfile } from '../helpers';
import { storage } from '../../src/integrations/storage/storage.client';
import request from 'supertest';
import app from '../../src/app';
import { PATHS } from '../constants';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import sharp from 'sharp';
import { BadGatewayError } from '../../src/errors/bad-gateway.error';
import { profilesRepository } from '../../src/modules/users/profiles.repository';

vi.mock('../../src/integrations/storage/storage.client', () => ({
  storage: {
    upload: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: (key: string) => `https://files.test/${key}`,
    getKeyFromUrl: (url: string) => url.replace('https://files.test/', ''),
  },
}));
beforeEach(() => vi.clearAllMocks());

beforeAll(() => redis.connect());
afterAll(async () => {
  await cleanup();
  await redis.quit();
});

describe('PUT /me/avatar', () => {
  it('checks if using the mock or not', () => {
    expect(vi.isMockFunction(storage.upload)).toBe(true);
  });

  it('returns 200', async () => {
    const { accessToken } = await userWithProfile();

    const res = await uploadAvatar(accessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.PROFILE_AVATAR_UPDATE_SUCCESS);

    const { avatarUrl } = res.body.data.profile;
    expect(avatarUrl).toMatch(/^https:\/\/files\.test\/avatars\/.+\.webp$/);

    expect(storage.upload).toHaveBeenCalledOnce();
    const { body, contentType } = vi.mocked(storage.upload).mock.calls[0]![0];
    expect(contentType).toBe('image/webp');

    const meta = await sharp(body).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(256);

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.avatarUrl).toBe(avatarUrl);
  });

  it('deletes the old file when the avatar is replaced', async () => {
    const { accessToken } = await userWithProfile();

    const first = await uploadAvatar(accessToken);
    const firstMe = await authed('get', PATHS.me, accessToken);

    expect(first.statusCode).toBe(200);
    expect(first.body.code).toBe(SUCCESS_CODES.PROFILE_AVATAR_UPDATE_SUCCESS);

    const second = await uploadAvatar(accessToken);
    const secondMe = await authed('get', PATHS.me, accessToken);

    expect(second.statusCode).toBe(200);
    expect(second.body.code).toBe(SUCCESS_CODES.PROFILE_AVATAR_UPDATE_SUCCESS);

    expect(storage.remove).toHaveBeenCalledOnce();
    const key = vi.mocked(storage.remove).mock.calls[0]![0];
    expect(key).toBe(storage.getKeyFromUrl(firstMe.body.data.profile.avatarUrl));

    expect(secondMe.body.data.profile.avatarUrl).not.toBe(firstMe.body.data.profile.avatarUrl);
  });

  it('returns 401 without a token', async () => {
    const png = await makePng();
    const first = await authed('put', PATHS.avatar, '').attach('avatar', png, {
      filename: 'me.png',
      contentType: 'image/png',
    });

    const second = await authed('put', PATHS.avatar, '24dxza4').attach('avatar', png, {
      filename: 'me.png',
      contentType: 'image/png',
    });

    const third = await request(app)
      .put(PATHS.avatar)
      .set('Authorization', '')
      .attach('avatar', png, { filename: 'me.png', contentType: 'image/png' });

    const fourth = await request(app)
      .put(PATHS.avatar)
      .attach('avatar', png, { filename: 'me.png', contentType: 'image/png' });

    expect(first.statusCode).toBe(401);
    expect(second.statusCode).toBe(401);
    expect(third.statusCode).toBe(401);
    expect(fourth.statusCode).toBe(401);
  });

  it('returns 404 when the user has no profile', async () => {
    const { accessToken } = await loginUser();
    const res = await uploadAvatar(accessToken);

    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.PROFILE_NOT_FOUND);
  });

  it('returns 400 when no file is sent', async () => {
    const { accessToken } = await userWithProfile();

    const res = await authed('put', PATHS.avatar, accessToken);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.FILE_MISSING);
  });

  it('returns 400 when the file is in a wrong field', async () => {
    const { accessToken } = await userWithProfile();
    const png = await makePng();

    const res = await authed('put', PATHS.avatar, accessToken).attach('invalid_field', png, {
      filename: 'me.png',
      contentType: 'image/png',
    });

    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.BAD_REQUEST_ERROR);
  });

  it('returns 413 when the file is over 2 MB', async () => {
    const { accessToken } = await userWithProfile();
    const res = await authed('put', PATHS.avatar, accessToken).attach(
      'avatar',
      Buffer.alloc(2 * 1024 * 1024 + 1),
      {
        filename: 'big.png',
        contentType: 'image/png',
      },
    );

    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(413);
    expect(res.body.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
  });

  it('returns 415 when the file is not an image', async () => {
    const { accessToken } = await userWithProfile();
    const res = await authed('put', PATHS.avatar, accessToken).attach(
      'avatar',
      Buffer.from('not an image'),
      {
        filename: 'fake.png',
        contentType: 'image/png',
      },
    );

    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(415);
    expect(res.body.error.code).toBe(ERROR_CODES.FILE_TYPE_NOT_SUPPORTED);
  });

  it('returns 415 when the picture has too many pixels', async () => {
    const { accessToken } = await userWithProfile();
    const png = await makePng(5000, 5000);
    const res = await authed('put', PATHS.avatar, accessToken).attach('avatar', png, {
      filename: 'me.png',
      contentType: 'image/png',
    });

    expect(storage.upload).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(415);
    expect(res.body.error.code).toBe(ERROR_CODES.FILE_TYPE_NOT_SUPPORTED);
  });

  it('returns 502 and keeps the old data when the upload fails', async () => {
    const { accessToken } = await userWithProfile();

    vi.mocked(storage.upload).mockRejectedValueOnce(
      new BadGatewayError('File upload failed.', ERROR_CODES.STORAGE_UPLOAD_FAILED),
    );

    const res = await uploadAvatar(accessToken);

    expect(res.statusCode).toBe(502);
    expect(res.body.error.code).toBe(ERROR_CODES.STORAGE_UPLOAD_FAILED);
    expect(storage.remove).not.toHaveBeenCalled();

    const me = await authed('get', PATHS.me, accessToken);
    expect(me.body.data.profile.avatarUrl).toBeNull();
  });

  it('deletes the new file when the database update finds no profile', async () => {
    const { accessToken } = await userWithProfile();
    vi.spyOn(profilesRepository, 'updateAvatarUrl').mockResolvedValueOnce(null);
    const res = await uploadAvatar(accessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe(ERROR_CODES.PROFILE_NOT_FOUND);

    const uploadedKey = vi.mocked(storage.upload).mock.calls[0]![0].key;
    expect(storage.remove).toHaveBeenCalledWith(uploadedKey);
  });
});
