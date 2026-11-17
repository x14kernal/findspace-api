import type { ShorthandWhereFilter } from '@prisma/orm-postgres/orm-client';
import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type {
  NewWorkspaceRow,
  UpdateWorkspaceRow,
  Workspace,
  WorkspaceWithLocation,
} from '../../types/workspace.types';
import type { Contract } from '../../prisma/contract';
import type { Varchar } from '@prisma/orm-postgres/target/codec-types';

function findOne(
  where: ShorthandWhereFilter<Contract, 'public', 'Workspace'>,
  client: DbClient = db,
): Promise<Workspace | null> {
  return client.orm.public.Workspace.where(where).first();
}

export const workspacesRepository = {
  findById(id: string, client: DbClient = db): Promise<Workspace | null> {
    return findOne({ id }, client);
  },

  findByOwnerId(ownerId: string, client: DbClient = db): Promise<Workspace | null> {
    return findOne({ ownerId }, client);
  },

  async findByOwnerIdWithLocation(
    ownerId: string,
    client: DbClient = db,
  ): Promise<WorkspaceWithLocation | null> {
    const row = await client.orm.public.Workspace.include('location', (l) => l.include('country'))
      .where({ ownerId })
      .first();

    return row as WorkspaceWithLocation | null;
  },

  findBySlug(slug: string, client: DbClient = db): Promise<Workspace | null> {
    return findOne({ slug }, client);
  },

  create(data: NewWorkspaceRow, client: DbClient = db): Promise<Workspace> {
    return client.orm.public.Workspace.create({ ...data, timezone: data.timezone as Varchar<50> });
  },

  update(id: string, data: UpdateWorkspaceRow, client: DbClient = db): Promise<Workspace | null> {
    const { timezone, ...rest } = data;
    return client.orm.public.Workspace.where({ id }).update({
      ...rest,
      ...(timezone !== undefined && { timezone: timezone as Varchar<50> }),
    });
  },
};
