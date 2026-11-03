import type { NewUser, User } from '../../types/user.types';
import { usersRepository } from './users.repository';

export const usersService = {
  async isEmailExist(email: string): Promise<boolean> {
    const user = await usersRepository.findByEmail(email);
    return user !== null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const user = await usersRepository.findByEmail(email);
    return user;
  },

  async findById(id: string): Promise<User | null> {
    const user = await usersRepository.findById(id);
    return user;
  },

  async create(data: NewUser): Promise<User> {
    return usersRepository.create(data);
  },
};
