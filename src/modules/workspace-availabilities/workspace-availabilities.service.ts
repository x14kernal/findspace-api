import { db } from '../../prisma/db';
import type {
  ReplaceWorkspaceAvailabilitiesInput,
  WorkspaceAvailability,
} from '../../types/workspace-availability.types';
import { workspacesService } from '../workspaces/workspaces.service';
import { workspaceAvailabilitiesRepository } from './workspace-availabilities.repository';

export const workspaceAvailabilitiesService = {
  async getOrThrow(ownerId: string): Promise<WorkspaceAvailability[]> {
    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    return workspaceAvailabilitiesRepository.findAllByWorkspaceId(workspace.id);
  },
  async replaceForOwner(
    ownerId: string,
    { availabilities }: ReplaceWorkspaceAvailabilitiesInput,
  ): Promise<WorkspaceAvailability[]> {
    const workspace = await workspacesService.getByOwnerOrThrow(ownerId);
    return db.transaction((tx) =>
      workspaceAvailabilitiesRepository.replaceAll(workspace.id, availabilities, tx),
    );
  },
};
