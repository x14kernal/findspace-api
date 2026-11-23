import type z from 'zod';
import type {
  replaceWorkspaceAvailabilityRowSchema,
  replaceWorkspaceAvailabilitiesSchema,
} from '../schemas/workspace-availability.schema';
import type { Exact } from './common';

export type ReplaceWorkspaceAvailabilityInput = Exact<
  z.infer<typeof replaceWorkspaceAvailabilityRowSchema>
>;
export type ReplaceWorkspaceAvailabilitiesInput = Exact<
  z.infer<typeof replaceWorkspaceAvailabilitiesSchema>
>;

export type DayOfWeek = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type WorkspaceAvailability = {
  id: string;
  workspaceId: string;
  dayOfWeek: DayOfWeek;
  startAt: string;
  endAt: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceAvailabilityResponse = {
  dayOfWeek: DayOfWeek;
  startAt: string;
  endAt: string;
};

export type WorkspaceAvailabilitiesResponse = {
  availabilities: WorkspaceAvailabilityResponse[];
};
