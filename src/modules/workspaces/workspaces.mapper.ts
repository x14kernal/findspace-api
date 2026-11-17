import type { WorkspaceResponse, WorkspaceWithLocation } from '../../types/workspace.types';
import { toLocationResponse } from '../locations/locations.mapper';

export const toWorkspaceResponse = (w: WorkspaceWithLocation): WorkspaceResponse => ({
  id: w.id,
  name: w.name,
  slug: w.slug,
  description: w.description,
  floorCount: w.floorCount,
  status: w.status,
  timezone: w.timezone,
  location: toLocationResponse(w.location),
  createdAt: w.createdAt.toISOString(),
  updatedAt: w.updatedAt.toISOString(),
});
