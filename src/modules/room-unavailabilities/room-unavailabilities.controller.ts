import type { Request, Response } from 'express';
import { roomUnavailabilitiesService } from './room-unavailabilities.service';
import { sendSuccess, sendSuccessWithoutData } from '../../responses/response-helpers';
import {
  toRoomUnavailabilitiesResponse,
  toRoomUnavailabilityResponse,
} from './room-unavailabilities.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const roomUnavailabilitiesController = {
  async get(req: Request, res: Response) {
    const data = await roomUnavailabilitiesService.getOrThrow(
      req.user!.id,
      res.locals.params.roomId,
    );
    sendSuccess(res, toRoomUnavailabilitiesResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOM_UNAVAILABILITIES_FETCHED,
    });
  },

  async create(req: Request, res: Response) {
    const data = await roomUnavailabilitiesService.create(
      req.user!.id,
      res.locals.params.roomId,
      req.body,
    );
    sendSuccess(res, toRoomUnavailabilityResponse(data), {
      status: 201,
      code: SUCCESS_CODES.ROOM_UNAVAILABILITY_CREATED,
    });
  },

  async deleteOne(req: Request, res: Response) {
    await roomUnavailabilitiesService.deleteOne(
      req.user!.id,
      res.locals.params.roomId,
      res.locals.params.unavailabilityId,
    );
    sendSuccessWithoutData(res, {
      status: 200,
      code: SUCCESS_CODES.ROOM_UNAVAILABILITY_DELETED,
    });
  },
};
