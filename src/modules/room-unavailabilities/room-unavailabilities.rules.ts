import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type { CreateRoomUnavailabilityInput } from '../../types/room-unavailability.types';
import { roomUnavailabilitiesRepository } from './room-unavailabilities.repository';

export async function hasOverlap(
  roomId: string,
  data: CreateRoomUnavailabilityInput,
  client: DbClient = db,
): Promise<boolean> {
  const { dayDate, startAt, endAt } = data;
  const dayUnavailabilities = await roomUnavailabilitiesRepository.findAllByRoomIdForDay(
    roomId,
    dayDate,
    client,
  );

  return dayUnavailabilities.some(
    (old) => startAt < old.endAt.slice(0, 5) && endAt > old.startAt.slice(0, 5),
  );
}
