import { db } from '../../prisma/db';

import type { DbClient } from '../../types/common';
import type { NewUser, User, UserWithProfile } from '../../types/user.types';
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

  findByGoogleId(googleId: string, client: DbClient = db): Promise<User | null> {
    return findOne({ googleId }, client);
  },

  findById(id: string, client: DbClient = db): Promise<User | null> {
    return findOne({ id }, client);
  },

  async findByIdWithProfile(id: string, client: DbClient = db): Promise<UserWithProfile | null> {
    const user = await client.orm.public.User.include('profile', (p) =>
      p.include('location', (l) => l.include('country')),
    )
      .where({ id })
      .first();

    if (!user) return null;
    if (!user.profile) return { ...user, profile: null };

    const { location } = user.profile;

    if (!location) {
      throw new Error(`Profile ${user.profile.id} has no location.`);
    }

    return { ...user, profile: { ...user.profile, location } };
  },

  create(data: NewUser, client: DbClient = db): Promise<User> {
    return client.orm.public.User.create(data);
  },
};
