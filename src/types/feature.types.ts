export type Feature = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FeatureResponse = Pick<Feature, 'id' | 'name' | 'slug' | 'description' | 'iconName'>;
