import { randomBytes } from 'node:crypto';
import { ConflictError } from '../../errors/conflict.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type {
  CreateWorkspaceInput,
  NewWorkspaceRow,
  WorkspaceWithLocation,
} from '../../types/workspace.types';
import { slugify } from '../../utils/slugify';
import { locationsService } from '../locations/locations.service';
import { workspacesRepository } from './workspaces.repository';
import { NotFoundError } from '../../errors/not-found.error';

export const workspacesService = {
  async getByOwnerOrThrow(ownerId: string): Promise<WorkspaceWithLocation> {
    const workspace = await workspacesRepository.findByOwnerIdWithLocation(ownerId);
    if (!workspace)
      throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
    return workspace;
  },
  async createForOwner(
    ownerId: string,
    data: CreateWorkspaceInput,
  ): Promise<WorkspaceWithLocation> {
    const base = slugify(data.name) || 'workspace';
    const slug = `${base}-${randomBytes(3).toString('hex')}`;

    try {
      return await db.transaction(async (tx) => {
        const ownerHasOne = await workspacesRepository.findByOwnerId(ownerId, tx);
        if (ownerHasOne) {
          throw new ConflictError(
            'The owner already has a workspace.',
            ERROR_CODES.WORKSPACE_OWNER_ALREADY_HAS_ONE,
          );
        }
        const { location, ...rest } = data;
        const locationId = (await locationsService.create(location, tx)).id;
        const newWordpaceRow: NewWorkspaceRow = {
          ...rest,
          ownerId,
          slug,
          locationId,
          status: 'active',
        };

        await workspacesRepository.create(newWordpaceRow, tx);
        const workspace = await workspacesRepository.findByOwnerIdWithLocation(ownerId, tx);
        if (!workspace)
          throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
        return workspace;
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
