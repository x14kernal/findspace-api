import z from 'zod';
import { timeSchema } from './common';

export const replaceWorkspaceAvailabilityRowSchema = z
  .object({
    dayOfWeek: z.enum(['1', '2', '3', '4', '5', '6', '7']),
    startAt: timeSchema,
    endAt: timeSchema,
  })
  .refine((row) => row.startAt < row.endAt);

export const replaceWorkspaceAvailabilitiesSchema = z.object({
  availabilities: z
    .array(replaceWorkspaceAvailabilityRowSchema)
    .max(7)
    .refine((rows) => new Set(rows.map((r) => r.dayOfWeek)).size === rows.length),
});
