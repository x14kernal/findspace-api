import type {
  RoomUnavailabilitiesResponse,
  RoomUnavailability,
  RoomUnavailabilityResponse,
} from '../../types/room-unavailability.types';

export const toRoomUnavailabilityResponse = ({
  id,
  dayDate,
  startAt,
  endAt,
  reason,
}: RoomUnavailability): RoomUnavailabilityResponse => {
  return { id, dayDate, startAt: startAt.slice(0, 5), endAt: endAt.slice(0, 5), reason };
};

export const toRoomUnavailabilitiesResponse = (
  data: RoomUnavailability[],
): RoomUnavailabilitiesResponse => {
  return {
    unavailabilities: data.map((r) => toRoomUnavailabilityResponse(r)),
  };
};
