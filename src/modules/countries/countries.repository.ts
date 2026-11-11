import { db } from '../../prisma/db';

import type { DbClient } from '../../types/common';
import type { ShorthandWhereFilter } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '../../prisma/contract';
import type { Country } from '../../types/country.types';

function findOne(
  where: ShorthandWhereFilter<Contract, 'public', 'Country'>,
  client: DbClient = db,
): Promise<Country | null> {
  return client.orm.public.Country.where(where).first();
}

export const countriesRepository = {
  findById(id: string, client: DbClient = db): Promise<Country | null> {
    return findOne({ id }, client);
  },

  async getAll(client: DbClient = db): Promise<Country[]> {
    return await client.orm.public.Country.all();
  },
};
