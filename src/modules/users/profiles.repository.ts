import { db } from '../../prisma/db';

import type { DbClient } from '../../types/common';
import type { ShorthandWhereFilter } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '../../prisma/contract';
import type { NewProfile, Profile, UpdateProfile } from '../../types/profile.types';

function findOne(
  where: ShorthandWhereFilter<Contract, 'public', 'Profile'>,
  client: DbClient = db,
): Promise<Profile | null> {
  return client.orm.public.Profile.where(where).first();
}

export const profilesRepository = {
  findById(id: string, client: DbClient = db): Promise<Profile | null> {
    return findOne({ id }, client);
  },

  findByUserId(userId: string, client: DbClient = db): Promise<Profile | null> {
    return findOne({ userId }, client);
  },

  create(data: NewProfile, client: DbClient = db): Promise<Profile> {
    return client.orm.public.Profile.create(data);
  },

  update(profileId: string, data: UpdateProfile, client: DbClient = db): Promise<Profile | null> {
    return client.orm.public.Profile.where({ id: profileId }).update(data);
  },
};
