import type { Feature, FeatureResponse } from '../../types/feature.types';

export function toFeatureResponse(f: Feature): FeatureResponse {
  return {
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    iconName: f.iconName,
  };
}
export function toFeaturesResponse(features: Feature[]): FeatureResponse[] {
  return features.map((f) => toFeatureResponse(f));
}
