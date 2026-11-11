import { db } from '../../prisma/db';

import type { DbClient } from '../../types/common';
import type { ShorthandWhereFilter } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '../../prisma/contract';
import type { Location, NewLocation, UpdateLocation } from '../../types/location.types';

function findOne(
  where: ShorthandWhereFilter<Contract, 'public', 'Location'>,
  client: DbClient = db,
): Promise<Location | null> {
  return client.orm.public.Location.where(where).first();
}

export const locationsRepository = {
  findById(id: string, client: DbClient = db): Promise<Location | null> {
    return findOne({ id }, client);
  },

  create(data: NewLocation, client: DbClient = db): Promise<Location> {
    return client.orm.public.Location.create(data);
  },

  update(
    locationId: string,
    data: UpdateLocation,
    client: DbClient = db,
  ): Promise<Location | null> {
    return client.orm.public.Location.where({ id: locationId }).update(data);
  },
};
