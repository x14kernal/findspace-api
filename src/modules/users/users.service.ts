import { NotFoundError } from '../../errors/not-found.error';
import { ERROR_CODES } from '../../i18n';
import type { NewUser, User, UserWithProfile } from '../../types/user.types';
import { usersRepository } from './users.repository';

export const usersService = {
  async isEmailExist(email: string): Promise<boolean> {
    const user = await usersRepository.findByEmail(email);
    return user !== null;
  },

  findByEmail(email: string): Promise<User | null> {
    return usersRepository.findByEmail(email);
  },

  findByGoogleId(googleId: string): Promise<User | null> {
    return usersRepository.findByGoogleId(googleId);
  },

  findById(id: string): Promise<User | null> {
    return usersRepository.findById(id);
  },

  create(data: NewUser): Promise<User> {
    return usersRepository.create(data);
  },

  async getMeOrThrow(id: string): Promise<UserWithProfile> {
    const user = await usersRepository.findByIdWithProfile(id);
    if (!user) {
      throw new NotFoundError('User not found.', ERROR_CODES.USER_NOT_FOUND);
    }
    return user;
  },
};
