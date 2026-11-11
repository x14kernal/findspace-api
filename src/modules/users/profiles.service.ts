import { ConflictError } from '../../errors/conflict.error';
import { NotFoundError } from '../../errors/not-found.error';
import { UnprocessableEntityError } from '../../errors/unprocessable-entity.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type { CreateProfileInput, Profile, UpdateProfileInput } from '../../types/profile.types';

import { countriesService } from '../countries/countries.service';
import { locationsService } from '../locations/locations.service';
import { profilesRepository } from './profiles.repository';

export const profilesService = {
  findByUserId(id: string): Promise<Profile | null> {
    return profilesRepository.findByUserId(id);
  },

  async create(userId: string, input: CreateProfileInput): Promise<Profile> {
    const { location: locationInput, ...data } = input;

    const userProfile = await profilesRepository.findByUserId(userId);
    if (userProfile) {
      throw new ConflictError('Profile already exists.', ERROR_CODES.PROFILE_ALREADY_EXISTS);
    }

    const country = await countriesService.findById(locationInput.countryId);
    if (!country) {
      throw new UnprocessableEntityError('Country not found.', ERROR_CODES.COUNTRY_NOT_FOUND);
    }

    return db.transaction(async (tx) => {
      const location = await locationsService.create(locationInput, tx);
      return profilesRepository.create({ ...data, userId, locationId: location.id }, tx);
    });
  },

  async update(userId: string, input: UpdateProfileInput): Promise<Profile> {
    const { location: locationInput, ...data } = input;

    const profile = await profilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.', ERROR_CODES.PROFILE_NOT_FOUND);
    }

    if (locationInput?.countryId) {
      const country = await countriesService.findById(locationInput.countryId);
      if (!country) {
        throw new UnprocessableEntityError('Country not found.', ERROR_CODES.COUNTRY_NOT_FOUND);
      }
    }

    const hasProfileChanges = Object.keys(data).length > 0;
    if (!locationInput && !hasProfileChanges) return profile; // {} changes nothing

    return db.transaction(async (tx) => {
      if (locationInput) {
        await locationsService.update(profile.locationId, locationInput, tx);
      }
      if (!hasProfileChanges) return profile;

      const updated = await profilesRepository.update(profile.id, data, tx);
      if (!updated) {
        throw new NotFoundError('Profile not found.', ERROR_CODES.PROFILE_NOT_FOUND);
      }
      return updated;
    });
  },
};
