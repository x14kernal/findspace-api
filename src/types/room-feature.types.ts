import type z from 'zod';
import type { Exact } from './common';
import type {
  replaceRoomFeatureRowSchema,
  replaceRoomFeaturesSchema,
} from '../schemas/room-feature.schema';
import type { Feature } from './feature.types';

export type ReplaceRoomFeatureRowInput = Exact<z.infer<typeof replaceRoomFeatureRowSchema>>;
export type ReplaceRoomFeaturesInput = Exact<z.infer<typeof replaceRoomFeaturesSchema>>;

export type RoomFeature = {
  id: string;
  roomId: string;
  featureId: string;
  featureDetails: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RoomFeatureWithFeature = RoomFeature & { feature: Feature };

export type RoomFeatureResponse = {
  featureId: string;
  name: string;
  slug: string;
  iconName: string | null;
  featureDetails: string | null;
  description: string | null;
};

export type RoomFeaturesResponse = { features: RoomFeatureResponse[] };
