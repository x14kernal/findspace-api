import { Router } from 'express';
import authRouter from './auth.routes.js';
import usersRouter from './users.routes.js';

const router = Router();

router.use('/', usersRouter);
router.use('/auth', authRouter);

export default router;
