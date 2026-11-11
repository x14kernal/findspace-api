import type { ProfileResponse, ProfileWithLocation } from '../../types/profile.types';
import type { MeResponse, User, UserResponse, UserWithProfile } from '../../types/user.types';
import { toLocationResponse } from '../locations/locations.mapper';

export const toUserResponse = ({ id, email, role }: User): UserResponse => {
  return { id, email, role };
};

export const toProfileResponse = ({
  firstName,
  lastName,
  bio,
  avatarUrl,
  phoneNumber,
  location,
}: ProfileWithLocation): ProfileResponse => {
  return {
    firstName,
    lastName,
    bio,
    avatarUrl,
    phoneNumber,
    location: toLocationResponse(location),
  };
};

export const toMeResponse = ({ id, email, role, profile }: UserWithProfile): MeResponse => {
  return {
    id,
    email,
    role,
    profile: profile ? toProfileResponse(profile) : null,
  };
};
