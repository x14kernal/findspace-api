import { Router } from 'express';
import { loginWithEmailSchema, signupWithEmailSchema } from '../schemas/auth.schema';
import { validateRequest } from '../middleware/validate-request';
import { authController } from '../modules/auth/auth.controller';

const router = Router();

router.post('/signup', validateRequest(signupWithEmailSchema), authController.signup);
router.post('/login', validateRequest(loginWithEmailSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// router.post('/google', (req, res) => {});

export default router;
