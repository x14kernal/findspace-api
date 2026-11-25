import type {
  RoomAvailabilitiesResponse,
  RoomAvailability,
  RoomAvailabilityResponse,
} from '../../types/room-availability.types';

const toRoomAvailabilityResponse = ({
  dayOfWeek,
  startAt,
  endAt,
}: RoomAvailability): RoomAvailabilityResponse => {
  return { dayOfWeek, startAt: startAt.slice(0, 5), endAt: endAt.slice(0, 5) };
};

export const toRoomAvailabilitiesResponse = (
  rows: RoomAvailability[],
): RoomAvailabilitiesResponse => ({
  availabilities: rows.map(toRoomAvailabilityResponse),
});
