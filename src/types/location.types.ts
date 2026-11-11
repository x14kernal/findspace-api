import z from 'zod';
import type { createLocationSchema, updateLocationSchema } from '../schemas/location.schema';
import type { Exact } from './common';
import type { Country, CountryResponse } from './country.types';

export type Location = {
  id: string;
  countryId: string;
  city: string | null;
  area: string | null;
  longitude: string | null;
  latitude: string | null;
  createdAt: Date;
};

export type LocationWithCountry = Location & { country: Country };

export type NewLocation = Exact<z.infer<typeof createLocationSchema>>;
export type UpdateLocation = Exact<z.infer<typeof updateLocationSchema>>;

export type LocationResponse = Pick<Location, 'city' | 'area'> & {
  longitude: number | null;
  latitude: number | null;
  country: CountryResponse;
};
