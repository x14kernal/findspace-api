import type { Request, Response } from 'express';
import { usersService } from './users.service';
import { SUCCESS_CODES } from '../../i18n';
import { sendSuccess } from '../../responses/response-helpers';
import { profilesService } from './profiles.service';
import { toMeResponse } from './users.mapper';

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
};
