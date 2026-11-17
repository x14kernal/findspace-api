import type z from 'zod';
import type { Exact } from './common';
import type { LocationResponse, LocationWithCountry } from './location.types';
import type { createWorkspaceSchema } from '../schemas/workspace.schema';

export type WorkspaceStatus = 'active' | 'inactive';

export type Workspace = {
  id: string;
  ownerId: string;
  locationId: string;
  name: string;
  slug: string;
  description: string | null;
  floorCount: number;
  status: WorkspaceStatus;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkspaceWithLocation = Workspace & {
  location: LocationWithCountry;
};

export type CreateWorkspaceInput = Exact<z.infer<typeof createWorkspaceSchema>>;

export type NewWorkspace = CreateWorkspaceInput & {
  ownerId: string;
  slug: string;
  status: WorkspaceStatus;
};

export type NewWorkspaceRow = Omit<NewWorkspace, 'location'> & { locationId: string };

export type WorkspaceResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  floorCount: number;
  status: WorkspaceStatus;
  timezone: string;
  location: LocationResponse;
  createdAt: string;
  updatedAt: string;
};
