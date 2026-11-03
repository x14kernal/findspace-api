import type { User, UserResponse } from '../../types/user.types';

export const toUserResponse = ({ id, email, role }: User): UserResponse => {
  return { id, email, role };
};
