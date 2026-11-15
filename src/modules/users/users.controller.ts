import type { Request, Response } from 'express';
import { usersService } from './users.service';
import { ERROR_CODES, SUCCESS_CODES } from '../../i18n';
import { sendSuccess } from '../../responses/response-helpers';
import { profilesService } from './profiles.service';
import { toMeResponse } from './users.mapper';
import { BadRequestError } from '../../errors/bad-request.error';

export const usersController = {
  async getMe(req: Request, res: Response) {
    const data = await usersService.getMeOrThrow(req.user!.id);
    sendSuccess(res, toMeResponse(data), {
      status: 200,
      code: SUCCESS_CODES.PROFILE_FETCH_SUCCESS,
    });
  },

  async createProfile(req: Request, res: Response) {
    await profilesService.create(req.user!.id, req.body);
    const data = await usersService.getMeOrThrow(req.user!.id);
    sendSuccess(res, toMeResponse(data), {
      status: 201,
      code: SUCCESS_CODES.PROFILE_CREATE_SUCCESS,
    });
  },

  async updateProfile(req: Request, res: Response) {
    await profilesService.update(req.user!.id, req.body);
    const data = await usersService.getMeOrThrow(req.user!.id);
    sendSuccess(res, toMeResponse(data), {
      status: 200,
      code: SUCCESS_CODES.PROFILE_UPDATE_SUCCESS,
    });
  },

  async updateAvatar(req: Request, res: Response) {
    if (!req.file) throw new BadRequestError('The file is missed.', ERROR_CODES.FILE_MISSING);
    await profilesService.updateAvatar(req.user!.id, req.file.buffer);
    const data = await usersService.getMeOrThrow(req.user!.id);
    sendSuccess(res, toMeResponse(data), {
      status: 200,
      code: SUCCESS_CODES.PROFILE_AVATAR_UPDATE_SUCCESS,
    });
  },
};
