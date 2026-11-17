import { Router } from 'express';
import authRouter from './auth.routes.js';
import usersRouter from './users.routes.js';
import countriesRouter from './countries.routes.js';
import workspacesRouter from './workspaces.routes.js';

const router = Router();

router.use('/', usersRouter);
router.use('/auth', authRouter);
router.use('/countries', countriesRouter);
router.use('/owner/workspace', workspacesRouter);

export default router;
