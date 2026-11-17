import z from 'zod';
import { createLocationSchema } from './location.schema';

const isValidTimezone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(1000).optional(),
  floorCount: z.number().int().positive().max(100),
  timezone: z.string().refine(isValidTimezone),
  location: createLocationSchema,
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
  description: z.string().trim().min(1).max(1000).nullable().optional(),
  location: createLocationSchema.partial().optional(),
});
