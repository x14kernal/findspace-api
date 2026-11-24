import type { Request, Response } from 'express';
import { sendSuccess } from '../../responses/response-helpers';
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
};
