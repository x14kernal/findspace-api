import type z from 'zod';
import type { Exact } from './common';
import type { createRoomSchema, updateRoomSchema } from '../schemas/room.schema';

export type Room = {
  id: string;
  workspaceId: string;
  name: string | null;
  description: string | null;
  code: string;
  pricePerHour: string;
  capacity: number;
  floorNumber: number;
  widthM: string;
  lengthM: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateRoomInput = Exact<z.infer<typeof createRoomSchema>>;
export type UpdateRoomInput = Exact<z.infer<typeof updateRoomSchema>>;

export type NewRoomRow = CreateRoomInput & { workspaceId: string };
export type UpdateRoomRow = UpdateRoomInput;

export type RoomResponse = {
  id: string;
  name: string | null;
  description: string | null;
  code: string;
  pricePerHour: string;
  capacity: number;
  floorNumber: number;
  widthM: string;
  lengthM: string;
  createdAt: string;
  updatedAt: string;
};
