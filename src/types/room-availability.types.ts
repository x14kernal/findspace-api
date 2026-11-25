import type z from 'zod';
import type {
  replaceRoomAvailabilityRowSchema,
  replaceRoomAvailabilitiesSchema,
} from '../schemas/room-availability.schema';
import type { Exact } from './common';

export type ReplaceRoomAvailabilityInput = Exact<z.infer<typeof replaceRoomAvailabilityRowSchema>>;
export type ReplaceRoomAvailabilitiesInput = Exact<z.infer<typeof replaceRoomAvailabilitiesSchema>>;

export type DayOfWeek = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type RoomAvailability = {
  id: string;
  roomId: string;
  dayOfWeek: DayOfWeek;
  startAt: string;
  endAt: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RoomAvailabilityResponse = {
  dayOfWeek: DayOfWeek;
  startAt: string;
  endAt: string;
};

export type RoomAvailabilitiesResponse = {
  availabilities: RoomAvailabilityResponse[];
};
