export type Role = 'customer' | 'owner' | 'admin';
export type SignupRole = Exclude<Role, 'admin'>;

export type User = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: Role;
  createdAt: Date;
};

export type NewUser = {
  email: string;
  passwordHash: string;
  role: Role;
};

export type UserResponse = Pick<User, 'id' | 'email' | 'role'>;
