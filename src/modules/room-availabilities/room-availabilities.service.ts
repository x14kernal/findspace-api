import { BadRequestError } from '../../errors/bad-request.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type {
  ReplaceRoomAvailabilitiesInput,
  RoomAvailability,
} from '../../types/room-availability.types';
import { roomsService } from '../rooms/rooms.service';
import { workspaceAvailabilitiesService } from '../workspace-availabilities/workspace-availabilities.service';
import { roomAvailabilitiesRepository } from './room-availabilities.repository';

export const roomAvailabilitiesService = {
  async getOrThrow(ownerId: string, roomId: string): Promise<RoomAvailability[]> {
    const room = await roomsService.getOrThrow(ownerId, roomId);
    return roomAvailabilitiesRepository.findAllByRoomId(room.id);
  },
  async replaceForOwner(
    ownerId: string,
    roomId: string,
    { availabilities }: ReplaceRoomAvailabilitiesInput,
  ): Promise<RoomAvailability[]> {
    const room = await roomsService.getOrThrow(ownerId, roomId);
    if (availabilities.length > 0) {
      const workspaceAvai = await workspaceAvailabilitiesService.getOrThrow(ownerId);

      availabilities.forEach((rAvai) => {
        const wAvai = workspaceAvai.find((i) => i.dayOfWeek === rAvai.dayOfWeek);
        if (!wAvai) {
          throw new BadRequestError(
            'The room availability day outside the workspace availability day',
            ERROR_CODES.ROOM_AVAILABILITY_OUTSIDE_WORKSPACE_DAYS,
          );
        }

        if (wAvai.startAt.slice(0, 5) > rAvai.startAt || wAvai.endAt.slice(0, 5) < rAvai.endAt) {
          throw new BadRequestError(
            `The room availability hours outside the workspace availability hours`,
            ERROR_CODES.ROOM_AVAILABILITY_OUTSIDE_WORKSPACE_HOURS,
          );
        }
      });
    }

    return db.transaction((tx) =>
      roomAvailabilitiesRepository.replaceAll(room.id, availabilities, tx),
    );
  },
};
