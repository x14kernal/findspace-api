import { Router } from 'express';
import { roomsController } from '../modules/rooms/rooms.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validate-request';
import { createRoomSchema, roomIdParamSchema, updateRoomSchema } from '../schemas/room.schema';
import { roomAvailabilitiesController } from '../modules/room-availabilities/room-availabilities.controller';
import { replaceRoomAvailabilitiesSchema } from '../schemas/room-availability.schema';
import { roomFeaturesController } from '../modules/room-features/room-features.controller';
import { replaceRoomFeaturesSchema } from '../schemas/room-feature.schema';
import { createRoomUnavailabilitySchema, roomUnavailabilityParamsSchema } from '../schemas/room-unavailability.schema';
import { roomUnavailabilitiesController } from '../modules/room-unavailabilities/room-unavailabilities.controller';

const router = Router();

router.get('/', authenticate, authorize('owner'), roomsController.getAll);
router.get(
  '/:roomId',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  roomsController.getOne,
);
router.post(
  '/',
  authenticate,
  authorize('owner'),
  validateRequest(createRoomSchema),
  roomsController.create,
);

router.patch(
  '/:roomId',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  validateRequest(updateRoomSchema),
  roomsController.update,
);

router.delete(
  '/:roomId',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  roomsController.deleteOne,
);

router.get(
  '/:roomId/availability',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  roomAvailabilitiesController.get,
);

router.put(
  '/:roomId/availability',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  validateRequest(replaceRoomAvailabilitiesSchema),
  roomAvailabilitiesController.replace,
);

router.put(
  '/:roomId/features',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  validateRequest(replaceRoomFeaturesSchema),
  roomFeaturesController.replace,
);

router.get(
  '/:roomId/unavailability',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  roomUnavailabilitiesController.get,
);

router.post(
  '/:roomId/unavailability',
  authenticate,
  authorize('owner'),
  validateRequest(roomIdParamSchema, 'params'),
  validateRequest(createRoomUnavailabilitySchema),
  roomUnavailabilitiesController.create,
);

router.delete(
  '/:roomId/unavailability/:unavailabilityId',
  authenticate,
  authorize('owner'),
  validateRequest(roomUnavailabilityParamsSchema, 'params'),
  roomUnavailabilitiesController.deleteOne,
);

export default router;
