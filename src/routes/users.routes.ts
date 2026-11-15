import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { usersController } from '../modules/users/users.controller';
import { validateRequest } from '../middleware/validate-request';
import { createProfileSchema, updateProfileSchema } from '../schemas/user.schema';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.get('/me', authenticate, usersController.getMe);

router.post(
  '/me/profile',
  authenticate,
  validateRequest(createProfileSchema),
  usersController.createProfile,
);

router.patch(
  '/me/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  usersController.updateProfile,
);

router.put('/me/avatar', authenticate, uploadAvatar, usersController.updateAvatar);

export default router;
