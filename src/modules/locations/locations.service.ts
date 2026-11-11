import type { DbClient } from '../../types/common';
import type { Location, NewLocation, UpdateLocation } from '../../types/location.types';
import { locationsRepository } from './locations.repository';

export const locationsService = {
  findById(id: string): Promise<Location | null> {
    return locationsRepository.findById(id);
  },

  create(data: NewLocation, client?: DbClient): Promise<Location> {
    return locationsRepository.create(data, client);
  },

  update(id: string, data: UpdateLocation, client?: DbClient): Promise<Location | null> {
    if (Object.keys(data).length === 0) return locationsRepository.findById(id, client);
    return locationsRepository.update(id, data, client);
  },
};
