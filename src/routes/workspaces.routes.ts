import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { workspacesController } from '../modules/workspaces/workspaces.controller';

import { createWorkspaceSchema } from '../schemas/workspace.schema';
import { validateRequest } from '../middleware/validate-request';

const router = Router();

router.get('/', authenticate, authorize('owner'), workspacesController.getMine);
router.post(
  '/',
  authenticate,
  authorize('owner'),
  validateRequest(createWorkspaceSchema),
  workspacesController.create,
);

export default router;
