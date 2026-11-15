import { randomUUID } from 'node:crypto';
import { ConflictError } from '../../errors/conflict.error';
import { NotFoundError } from '../../errors/not-found.error';
import { UnprocessableEntityError } from '../../errors/unprocessable-entity.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type { CreateProfileInput, Profile, UpdateProfileInput } from '../../types/profile.types';
import { processAvatar } from '../../utils/image';

import { countriesService } from '../countries/countries.service';
import { locationsService } from '../locations/locations.service';
import { profilesRepository } from './profiles.repository';
import { storage } from '../../integrations/storage/storage.client';

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

  async updateAvatar(userId: string, buffer: Buffer): Promise<Profile> {
    const profile = await profilesRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Profile not found.', ERROR_CODES.PROFILE_NOT_FOUND);
    }

    const body = await processAvatar(buffer);
    const key = `avatars/${randomUUID()}.webp`;

    await storage.upload({ key, body, contentType: 'image/webp' });

    let updated: Profile;
    try {
      const result = await profilesRepository.updateAvatarUrl(
        profile.id,
        storage.getPublicUrl(key),
      );
      if (!result) throw new NotFoundError('Profile not found.', ERROR_CODES.PROFILE_NOT_FOUND);
      updated = result;
    } catch (err) {
      await storage.remove(key); // undo the upload
      throw err;
    }

    const oldKey = profile.avatarUrl ? storage.getKeyFromUrl(profile.avatarUrl) : null;
    if (oldKey) await storage.remove(oldKey);

    return updated;
  },
};
