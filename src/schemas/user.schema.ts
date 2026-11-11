import z from 'zod';
import { createLocationSchema, updateLocationSchema } from './location.schema';

const profileFields = {
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/),
  bio: z.string().trim().max(150),
};

export const createProfileSchema = z
  .object({
    firstName: profileFields.firstName,
    lastName: profileFields.lastName,
    phoneNumber: profileFields.phoneNumber.optional(),
    bio: profileFields.bio.optional(),
    location: createLocationSchema,
  })
  .strict();

export const updateProfileSchema = z
  .object({
    firstName: profileFields.firstName.optional(),
    lastName: profileFields.lastName.optional(),
    phoneNumber: profileFields.phoneNumber.nullable().optional(),
    bio: profileFields.bio.nullable().optional(),
    location: updateLocationSchema.optional(),
  })
  .strict();
