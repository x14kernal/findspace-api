import { BadRequestError } from '../../errors/bad-request.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import { roomsRepository } from './rooms.repository';

export const assertFloorCountFitsRooms = async (
  workspaceId: string,
  floorCount: number,
  client: DbClient = db,
) => {
  const highest = await roomsRepository.findHighestFloorNumberByWorkspaceId(workspaceId, client);
  if (highest !== null && floorCount < highest) {
    throw new BadRequestError(
      'The workspace floor count cannot be lower than the highest room floor.',
      ERROR_CODES.WORKSPACE_FLOOR_BELOW_ROOMS,
    );
  }
};
