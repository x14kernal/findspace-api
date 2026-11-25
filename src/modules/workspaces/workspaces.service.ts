import { randomBytes } from 'node:crypto';
import { ConflictError } from '../../errors/conflict.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type {
  CreateWorkspaceInput,
  NewWorkspaceRow,
  UpdateWorkspaceInput,
  Workspace,
  WorkspaceWithLocation,
} from '../../types/workspace.types';
import { slugify } from '../../utils/slugify';
import { locationsService } from '../locations/locations.service';
import { workspacesRepository } from './workspaces.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { assertFloorCountFitsRooms } from '../rooms/rooms.rules';

export const workspacesService = {
  async getByOwnerOrThrow(ownerId: string): Promise<Workspace> {
    const workspace = await workspacesRepository.findByOwnerId(ownerId);
    if (!workspace)
      throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
    return workspace;
  },
  async getWithLocationByOwnerOrThrow(ownerId: string): Promise<WorkspaceWithLocation> {
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
  async updateForOwner(
    ownerId: string,
    data: UpdateWorkspaceInput,
  ): Promise<WorkspaceWithLocation> {
    return await db.transaction(async (tx) => {
      const ownerWorkspace = await workspacesRepository.findByOwnerId(ownerId, tx);
      if (!ownerWorkspace) {
        throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
      }

      if (data.floorCount !== undefined) {
        await assertFloorCountFitsRooms(ownerWorkspace.id, data.floorCount, tx);
      }

      const { location, ...updateWordpaceRow } = data;

      if (location && Object.keys(location).length > 0) {
        await locationsService.update(ownerWorkspace.locationId, location, tx);
      }

      if (Object.keys(updateWordpaceRow).length > 0) {
        const updated = await workspacesRepository.update(ownerWorkspace.id, updateWordpaceRow, tx);
        if (!updated)
          throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
      }

      const workspace = await workspacesRepository.findByOwnerIdWithLocation(ownerId, tx);
      if (!workspace) {
        throw new NotFoundError('The workspace not found.', ERROR_CODES.WORKSPACE_NOT_FOUND);
      }

      return workspace;
    });
  },
};
