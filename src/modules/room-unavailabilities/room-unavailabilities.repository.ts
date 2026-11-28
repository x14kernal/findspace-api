import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type {
  CreateRoomUnavailabilityInput,
  RoomUnavailability,
} from '../../types/room-unavailability.types';

export const roomUnavailabilitiesRepository = {
  findAllByRoomId(roomId: string, client: DbClient = db): Promise<RoomUnavailability[]> {
    return client.orm.public.RoomUnavailability.where({ roomId })
      .orderBy([(u) => u.dayDate.asc(), (u) => u.startAt.asc()])
      .all()
      .toArray();
  },

  findAllByRoomIdForDay(
    roomId: string,
    dayDate: string,
    client: DbClient = db,
  ): Promise<RoomUnavailability[]> {
    return client.orm.public.RoomUnavailability.where({ roomId, dayDate }).all().toArray();
  },

  async create(
    roomId: string,
    data: CreateRoomUnavailabilityInput,
    client: DbClient = db,
  ): Promise<RoomUnavailability> {
    return client.orm.public.RoomUnavailability.create({ ...data, roomId });
  },

  remove(id: string, roomId: string, client: DbClient = db): Promise<RoomUnavailability | null> {
    return client.orm.public.RoomUnavailability.where({ id, roomId }).delete();
  },
};
