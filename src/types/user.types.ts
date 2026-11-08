export type Role = 'customer' | 'owner' | 'admin';
export type SignupRole = Exclude<Role, 'admin'>;

export type User = {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  role: Role;
  createdAt: Date;
};

export type NewUser =
  | {
      email: string;
      passwordHash: string;
      googleId?: never;
      role: Role;
    }
  | {
      email: string;
      googleId: string;
      passwordHash?: never;
      role: Role;
    };
export type UserResponse = Pick<User, 'id' | 'email' | 'role'>;
