import type {
  WorkspaceAvailabilitiesResponse,
  WorkspaceAvailability,
  WorkspaceAvailabilityResponse,
} from '../../types/workspace-availability.types';

const toWorkspaceAvailabilityResponse = ({
  dayOfWeek,
  startAt,
  endAt,
}: WorkspaceAvailability): WorkspaceAvailabilityResponse => {
  return { dayOfWeek, startAt: startAt.slice(0, 5), endAt: endAt.slice(0, 5) };
};

export const toWorkspaceAvailabilitiesResponse = (
  rows: WorkspaceAvailability[],
): WorkspaceAvailabilitiesResponse => ({
  availabilities: rows.map(toWorkspaceAvailabilityResponse),
});
