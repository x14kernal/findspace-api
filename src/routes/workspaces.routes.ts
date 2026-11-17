import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { workspacesController } from '../modules/workspaces/workspaces.controller';

import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas/workspace.schema';
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
router.patch(
  '/',
  authenticate,
  authorize('owner'),
  validateRequest(updateWorkspaceSchema),
  workspacesController.update,
);

export default router;
