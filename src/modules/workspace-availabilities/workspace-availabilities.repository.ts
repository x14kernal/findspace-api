import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type {
  ReplaceWorkspaceAvailabilityInput,
  WorkspaceAvailability,
} from '../../types/workspace-availability.types';

export const workspaceAvailabilitiesRepository = {
  findAllByWorkspaceId(
    workspaceId: string,
    client: DbClient = db,
  ): Promise<WorkspaceAvailability[]> {
    return client.orm.public.WorkspaceAvailability.where({ workspaceId })
      .orderBy((w) => w.dayOfWeek.asc())
      .all()
      .toArray();
  },

  async replaceAll(
    workspaceId: string,
    rows: ReplaceWorkspaceAvailabilityInput[],
    client: DbClient = db,
  ): Promise<WorkspaceAvailability[]> {
    await client.orm.public.WorkspaceAvailability.where({ workspaceId }).deleteAll();
    if (rows.length === 0) return [];
    return client.orm.public.WorkspaceAvailability.createAll(
      rows.map((r) => ({ ...r, workspaceId })),
    ).toArray();
  },
};
