import type { LocationResponse, LocationWithCountry } from '../../types/location.types';
import { toCountryResponse } from '../countries/countries.mapper';

export const toLocationResponse = ({
  city,
  area,
  latitude,
  longitude,
  country,
}: LocationWithCountry): LocationResponse => {
  return {
    city,
    area,
    latitude: toNumber(latitude),
    longitude: toNumber(longitude),
    country: toCountryResponse(country),
  };
};

const toNumber = (v: string | null): number | null => (v === null ? null : Number(v));
