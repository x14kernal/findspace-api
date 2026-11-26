import type { Request, Response } from 'express';
import { roomFeaturesService } from './room-features.service';
import { sendSuccess } from '../../responses/response-helpers';
import { toRoomFeaturesResponse } from './room-features.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const roomFeaturesController = {
  async replace(req: Request, res: Response) {
    const roomFeatures = await roomFeaturesService.replaceForOwner(
      req.user!.id,
      res.locals.params.roomId,
      req.body,
    );

    sendSuccess(res, toRoomFeaturesResponse(roomFeatures), {
      status: 200,
      code: SUCCESS_CODES.ROOM_FEATURES_UPDATED,
    });
  },
};
