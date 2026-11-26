import type { Feature } from '../../types/feature.types';
import { featuresRepository } from './features.repository';

export const featuresService = {
  getAll(): Promise<Feature[]> {
    return featuresRepository.findAll();
  },
  getAllByIds(ids: string[]): Promise<Feature[]> {
    return featuresRepository.findAllByIds(ids);
  },
};
