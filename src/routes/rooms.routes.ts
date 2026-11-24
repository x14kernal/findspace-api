import { Router } from 'express';
import { roomsController } from '../modules/rooms/rooms.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateRequest } from '../middleware/validate-request';
import { createRoomSchema, roomIdParamSchema, updateRoomSchema } from '../schemas/room.schema';

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

export default router;
