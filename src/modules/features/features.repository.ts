import { db } from '../../prisma/db';
import type { DbClient } from '../../types/common';
import type { Feature } from '../../types/feature.types';

export const featuresRepository = {
  findAll(client: DbClient = db): Promise<Feature[]> {
    return client.orm.public.Feature.orderBy((f) => f.name.asc())
      .all()
      .toArray();
  },
  findAllByIds(ids: string[], client: DbClient = db): Promise<Feature[]> {
    return client.orm.public.Feature.where((f) => f.id.in(ids))
      .all()
      .toArray();
  },
};
