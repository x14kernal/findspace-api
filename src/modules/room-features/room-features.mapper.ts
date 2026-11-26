import type {
  RoomFeatureResponse,
  RoomFeaturesResponse,
  RoomFeatureWithFeature,
} from '../../types/room-feature.types';

export function toRoomFeatureResponse(i: RoomFeatureWithFeature): RoomFeatureResponse {
  return {
    featureId: i.feature.id,
    slug: i.feature.slug,
    name: i.feature.name,
    description: i.feature.description,
    featureDetails: i.featureDetails,
    iconName: i.feature.iconName,
  };
}

export function toRoomFeaturesResponse(items: RoomFeatureWithFeature[]): RoomFeaturesResponse {
  return { features: items.map((i) => toRoomFeatureResponse(i)) };
}
