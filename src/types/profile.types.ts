import type z from 'zod';
import type { createProfileSchema, updateProfileSchema } from '../schemas/user.schema';
import type { Exact } from './common';
import type { LocationResponse, LocationWithCountry } from './location.types';

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  locationId: string;
  bio: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  createdAt: Date;
};

export type ProfileWithLocation = Profile & { location: LocationWithCountry };

export type ProfileResponse = Pick<
  Profile,
  'firstName' | 'lastName' | 'bio' | 'avatarUrl' | 'phoneNumber'
> & {
  location: LocationResponse;
};

export type NewProfile = {
  userId: string;
  firstName: string;
  lastName: string;
  locationId: string;
  bio?: string | null;
  phoneNumber?: string | null;
};
export type UpdateProfile = Partial<Omit<NewProfile, 'userId'>>;

export type CreateProfileInput = Exact<z.infer<typeof createProfileSchema>>;
export type UpdateProfileInput = Exact<z.infer<typeof updateProfileSchema>>;
