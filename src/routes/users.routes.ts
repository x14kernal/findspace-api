import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { usersController } from '../modules/users/users.controller';
import { validateRequest } from '../middleware/validate-request';
import { createProfileSchema, updateProfileSchema } from '../schemas/user.schema';

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

export default router;
