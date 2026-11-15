import type { RequestHandler } from 'express';
import multer from 'multer';
import { BadRequestError } from '../errors/bad-request.error';
import { PayloadTooLargeError } from '../errors/payload-too-large.error';
import { ERROR_CODES } from '../i18n';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE, files: 1 },
});

export const uploadAvatar: RequestHandler = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new PayloadTooLargeError('File is too large.', ERROR_CODES.FILE_TOO_LARGE));
      }
      return next(new BadRequestError());
    }

    return next(err);
  });
};
