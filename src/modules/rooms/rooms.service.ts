import { BadRequestError } from '../../errors/bad-request.error';
import { ConflictError } from '../../errors/conflict.error';
import { NotFoundError } from '../../errors/not-found.error';
import { ERROR_CODES } from '../../i18n';
import type { CreateRoomInput, Room } from '../../types/room.types';
import { workspacesService } from '../workspaces/workspaces.service';
import { roomsRepository } from './rooms.repository';

export const roomsService = {
  async getAllOrThrow(ownerId: string): Promise<Room[]> {
    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    return roomsRepository.findAllByWorkspaceId(workspace.id);
  },

  async getOrThrow(ownerId: string, roomId: string): Promise<Room> {
    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    const room = await roomsRepository.findByIdAndWorkspaceId(roomId, workspace.id);
    if (!room) {
      throw new NotFoundError('The room not found.', ERROR_CODES.ROOM_NOT_FOUND);
    }
    return room;
  },

  async create(ownerId: string, data: CreateRoomInput): Promise<Room> {
    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    if (data.floorNumber > workspace.floorCount) {
      throw new BadRequestError(
        'The room floor number must not be greater than the workspace floor count.',
        ERROR_CODES.ROOM_FLOOR_EXCEEDS_WORKSPACE,
      );
    }

    const sameCode = await roomsRepository.findByCodeAndWorkspaceId(data.code, workspace.id);
    if (sameCode) {
      throw new ConflictError(
        'The room code already exists.',
        ERROR_CODES.ROOM_CODE_ALREADY_EXISTS,
      );
    }

    return roomsRepository.create({ ...data, workspaceId: workspace.id });
  },
};
