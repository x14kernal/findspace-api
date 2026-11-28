import type z from 'zod';

import type { Exact } from './common';
import type { createRoomUnavailabilitySchema } from '../schemas/room-unavailability.schema';

export type CreateRoomUnavailabilityInput = Exact<z.infer<typeof createRoomUnavailabilitySchema>>;

export type RoomUnavailability = Exact<{
  id: string;
  roomId: string;
  dayDate: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type RoomUnavailabilityResponse = {
  id: string;
  dayDate: string;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type RoomUnavailabilitiesResponse = {
  unavailabilities: RoomUnavailabilityResponse[];
};
