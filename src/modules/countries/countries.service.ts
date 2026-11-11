import type { Country } from '../../types/country.types';

import { countriesRepository } from './countries.repository';

export const countriesService = {
  async getAll(): Promise<Country[]> {
    const countries = await countriesRepository.getAll();
    return countries;
  },

  findById(id: string): Promise<Country | null> {
    return countriesRepository.findById(id);
  },
};
