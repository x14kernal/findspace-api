import z from 'zod';
import { timeSchema } from './common';
import { roomIdParamSchema } from './room.schema';

export const roomUnavailabilityParamsSchema = roomIdParamSchema.extend({
  unavailabilityId: z.uuid(),
});
export const createRoomUnavailabilitySchema = z
  .object({
    dayDate: z.iso.date(),
    startAt: timeSchema,
    endAt: timeSchema,
    reason: z.string().trim().min(1).max(200).optional(),
  })
  .refine((data) => data.startAt < data.endAt);
