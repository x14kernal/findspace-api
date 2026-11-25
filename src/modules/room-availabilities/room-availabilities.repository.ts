import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type {
  ReplaceRoomAvailabilityInput,
  RoomAvailability,
} from '../../types/room-availability.types';

export const roomAvailabilitiesRepository = {
  findAllByRoomId(roomId: string, client: DbClient = db): Promise<RoomAvailability[]> {
    return client.orm.public.RoomAvailability.where({ roomId })
      .orderBy((w) => w.dayOfWeek.asc())
      .all()
      .toArray();
  },

  async replaceAll(
    roomId: string,
    rows: ReplaceRoomAvailabilityInput[],
    client: DbClient = db,
  ): Promise<RoomAvailability[]> {
    await client.orm.public.RoomAvailability.where({ roomId }).deleteAll();
    if (rows.length === 0) return [];
    return client.orm.public.RoomAvailability.createAll(
      rows.map((r) => ({ ...r, roomId })),
    ).toArray();
  },
};
