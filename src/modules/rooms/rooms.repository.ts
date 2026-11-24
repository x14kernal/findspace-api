import type { Numeric, Varchar } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type { NewRoomRow, Room } from '../../types/room.types';

export const roomsRepository = {
  findAllByWorkspaceId(workspaceId: string, client: DbClient = db): Promise<Room[]> {
    return client.orm.public.Room.where({ workspaceId })
      .orderBy((r) => r.code.asc())
      .all()
      .toArray();
  },

  findByIdAndWorkspaceId(
    roomId: string,
    workspaceId: string,
    client: DbClient = db,
  ): Promise<Room | null> {
    return client.orm.public.Room.where({ workspaceId, id: roomId }).first();
  },

  findByCodeAndWorkspaceId(
    code: string,
    workspaceId: string,
    client: DbClient = db,
  ): Promise<Room | null> {
    return client.orm.public.Room.where({ workspaceId, code: code as Varchar<25> }).first();
  },

  create(data: NewRoomRow, client: DbClient = db): Promise<Room> {
    return client.orm.public.Room.create({
      ...data,
      code: data.code as Varchar<25>,
      lengthM: data.lengthM as Numeric<4, 2>,
      widthM: data.widthM as Numeric<4, 2>,
      pricePerHour: data.pricePerHour as Numeric<12, 2>,
    });
  },
};
