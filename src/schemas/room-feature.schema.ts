import z from 'zod';

export const replaceRoomFeatureRowSchema = z.object({
  featureId: z.uuid(),
  featureDetails: z.string().trim().min(1).max(200).optional(),
});

export const replaceRoomFeaturesSchema = z.object({
  features: z
    .array(replaceRoomFeatureRowSchema)
    .max(20)
    .refine((items) => new Set(items.map((i) => i.featureId)).size === items.length),
});
