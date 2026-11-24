import type { Request, Response } from 'express';
import { sendSuccess, sendSuccessWithoutData } from '../../responses/response-helpers';
import { roomsService } from './rooms.service';
import { toRoomResponse, toRoomsResponse } from './rooms.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const roomsController = {
  async getAll(req: Request, res: Response) {
    const data = await roomsService.getAllOrThrow(req.user!.id);
    return sendSuccess(res, toRoomsResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOMS_FETCHED,
    });
  },
  async getOne(req: Request, res: Response) {
    const data = await roomsService.getOrThrow(req.user!.id, res.locals.params.roomId);
    return sendSuccess(res, toRoomResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOM_FETCHED,
    });
  },
  async create(req: Request, res: Response) {
    const data = await roomsService.create(req.user!.id, req.body);
    return sendSuccess(res, toRoomResponse(data), {
      status: 201,
      code: SUCCESS_CODES.ROOM_CREATED,
    });
  },
  async update(req: Request, res: Response) {
    const data = await roomsService.updateForOwner(
      req.user!.id,
      res.locals.params.roomId,
      req.body,
    );
    return sendSuccess(res, toRoomResponse(data), {
      status: 200,
      code: SUCCESS_CODES.ROOM_UPDATED,
    });
  },
  async deleteOne(req: Request, res: Response) {
    await roomsService.deleteOne(req.user!.id, res.locals.params.roomId);
    return sendSuccessWithoutData(res, {
      status: 200,
      code: SUCCESS_CODES.ROOM_DELETED,
    });
  },
};
