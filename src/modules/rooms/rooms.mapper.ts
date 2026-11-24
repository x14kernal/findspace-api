import type { Room, RoomResponse } from '../../types/room.types';

export const toRoomResponse = (r: Room): RoomResponse => {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    code: r.code,
    pricePerHour: r.pricePerHour,
    capacity: r.capacity,
    floorNumber: r.floorNumber,
    widthM: r.widthM,
    lengthM: r.lengthM,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
};

export const toRoomsResponse = (rooms: Room[]): RoomResponse[] => {
  return rooms.map((r) => toRoomResponse(r));
};
