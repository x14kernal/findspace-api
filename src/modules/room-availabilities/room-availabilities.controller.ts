import type { Request, Response } from 'express';
import { roomAvailabilitiesService } from './room-availabilities.service';
import { sendSuccess } from '../../responses/response-helpers';
import { toRoomAvailabilitiesResponse } from './room-availabilities.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const roomAvailabilitiesController = {
  async get(req: Request, res: Response) {
    const data = await roomAvailabilitiesService.getOrThrow(req.user!.id, res.locals.params.roomId);
    sendSuccess(res, toRoomAvailabilitiesResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOM_AVAILABILITY_FETCHED,
    });
  },

  async replace(req: Request, res: Response) {
    const data = await roomAvailabilitiesService.replaceForOwner(
      req.user!.id,
      res.locals.params.roomId,
      req.body,
    );
    sendSuccess(res, toRoomAvailabilitiesResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOM_AVAILABILITY_UPDATED,
    });
  },
};
