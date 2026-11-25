import z from 'zod';
import { positiveDecimalString } from './common';

export const roomIdParamSchema = z.object({ roomId: z.uuid() });

export const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  code: z.string().trim().min(1).max(25),
  pricePerHour: positiveDecimalString(10),
  capacity: z.number().int().min(1).max(200),
  floorNumber: z.number().int().min(1).max(100),
  widthM: positiveDecimalString(2),
  lengthM: positiveDecimalString(2),
});

export const updateRoomSchema = createRoomSchema.partial().extend({
  name: z.string().trim().min(1).max(100).nullable().optional(),
  description: z.string().trim().min(1).max(1000).nullable().optional(),
});
