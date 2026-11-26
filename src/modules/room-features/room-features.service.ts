import { BadRequestError } from '../../errors/bad-request.error';
import { ERROR_CODES } from '../../i18n';
import { db } from '../../prisma/db';
import type {
  ReplaceRoomFeaturesInput,
  RoomFeatureWithFeature,
} from '../../types/room-feature.types';
import { featuresService } from '../features/features.service';
import { roomsService } from '../rooms/rooms.service';
import { roomFeaturesRepository } from './room-features.repository';

export const roomFeaturesService = {
  async replaceForOwner(
    ownerId: string,
    roomId: string,
    { features }: ReplaceRoomFeaturesInput,
  ): Promise<RoomFeatureWithFeature[]> {
    const room = await roomsService.getOrThrow(ownerId, roomId);

    if (features.length > 0) {
      const foundFeatures = await featuresService.getAllByIds(features.map((f) => f.featureId));
      if (foundFeatures.length !== features.length) {
        throw new BadRequestError('Some features do not exist.', ERROR_CODES.FEATURE_NOT_FOUND);
      }
    }

    return db.transaction(async (tx) => {
      await roomFeaturesRepository.replaceAll(room.id, features, tx);
      return roomFeaturesRepository.findAllByRoomIdWithFeature(room.id, tx);
    });
  },
};
