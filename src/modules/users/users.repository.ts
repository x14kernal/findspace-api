import { db } from '../../prisma/db';

import type { DbClient } from '../../types/common';
import type { NewUser, User } from '../../types/user.types';
import type { ShorthandWhereFilter } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '../../prisma/contract';

function findOne(
  where: ShorthandWhereFilter<Contract, 'public', 'User'>,
  client: DbClient = db,
): Promise<User | null> {
  return client.orm.public.User.where(where).first();
}

export const usersRepository = {
  findByEmail(email: string, client: DbClient = db): Promise<User | null> {
    return findOne({ email }, client);
  },

  findById(id: string, client: DbClient = db): Promise<User | null> {
    return findOne({ id }, client);
  },

  create(data: NewUser, client: DbClient = db): Promise<User> {
    return client.orm.public.User.create(data);
  },
};
