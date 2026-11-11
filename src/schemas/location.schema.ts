import { z } from 'zod';

const locationFields = {
  countryId: z.uuid(),
  city: z.string().trim().min(1).max(100),
  area: z.string().trim().min(1).max(100),
  longitude: z.number().min(-180).max(180).transform(String),
  latitude: z.number().min(-90).max(90).transform(String),
};

export const createLocationSchema = z
  .object({
    countryId: locationFields.countryId,
    city: locationFields.city.optional(),
    area: locationFields.area.optional(),
    longitude: locationFields.longitude.optional(),
    latitude: locationFields.latitude.optional(),
  })
  .strict();

export const updateLocationSchema = z
  .object({
    countryId: locationFields.countryId,
    city: locationFields.city.nullable(),
    area: locationFields.area.nullable(),
    longitude: locationFields.longitude.nullable(),
    latitude: locationFields.latitude.nullable(),
  })
  .partial()
  .strict();
