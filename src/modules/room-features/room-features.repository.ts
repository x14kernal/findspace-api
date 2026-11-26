import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type {
  ReplaceRoomFeatureRowInput,
  RoomFeature,
  RoomFeatureWithFeature,
} from '../../types/room-feature.types';

export const roomFeaturesRepository = {
  async replaceAll(
    roomId: string,
    rows: ReplaceRoomFeatureRowInput[],
    client: DbClient = db,
  ): Promise<RoomFeature[]> {
    await client.orm.public.RoomFeature.where({ roomId }).deleteAll();
    if (rows.length <= 0) return [];
    return client.orm.public.RoomFeature.createAll(rows.map((r) => ({ ...r, roomId }))).toArray();
  },

  findAllByRoomIdWithFeature(
    roomId: string,
    client: DbClient = db,
  ): Promise<RoomFeatureWithFeature[]> {
    return client.orm.public.RoomFeature.where({ roomId })
      .include('feature')
      .orderBy((f) => f.feature.name.asc())
      .all()
      .toArray();
  },
};
