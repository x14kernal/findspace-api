import { BadRequestError } from '../../errors/bad-request.error';
import { ConflictError } from '../../errors/conflict.error';
import { NotFoundError } from '../../errors/not-found.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';

import type {
  CreateRoomUnavailabilityInput,
  RoomUnavailability,
} from '../../types/room-unavailability.types';
import { todayInTimezone } from '../../utils/date';
import { roomsService } from '../rooms/rooms.service';
import { workspacesService } from '../workspaces/workspaces.service';
import { roomUnavailabilitiesRepository } from './room-unavailabilities.repository';
import { hasOverlap } from './room-unavailabilities.rules';

export const roomUnavailabilitiesService = {
  async getOrThrow(ownerId: string, roomId: string): Promise<RoomUnavailability[]> {
    const room = await roomsService.getOrThrow(ownerId, roomId);
    return roomUnavailabilitiesRepository.findAllByRoomId(room.id);
  },

  async create(
    ownerId: string,
    roomId: string,
    data: CreateRoomUnavailabilityInput,
  ): Promise<RoomUnavailability> {
    const room = await roomsService.getOrThrow(ownerId, roomId);

    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    if (data.dayDate < todayInTimezone(workspace.timezone)) {
      throw new BadRequestError(
        'The day date must be today date or upcoming one.',
        ERROR_CODES.ROOM_UNAVAILABILITY_IN_PAST,
      );
    }

    return db.transaction(async (tx) => {
      if (await hasOverlap(roomId, data, tx)) {
        throw new ConflictError('There is overlap.', ERROR_CODES.ROOM_UNAVAILABILITY_OVERLAPS);
      }
      return roomUnavailabilitiesRepository.create(room.id, data, tx);
    });
  },

  async deleteOne(ownerId: string, roomId: string, unavailabilityId: string): Promise<void> {
    const room = await roomsService.getOrThrow(ownerId, roomId);
    const deleted = await roomUnavailabilitiesRepository.remove(unavailabilityId, room.id);

    if (!deleted) {
      throw new NotFoundError(
        'This unavailability record not found.',
        ERROR_CODES.ROOM_UNAVAILABILITY_NOT_FOUND,
      );
    }
  },
};
