import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { workspacesController } from '../modules/workspaces/workspaces.controller';

import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas/workspace.schema';
import { validateRequest } from '../middleware/validate-request';
import { workspaceAvailabilitiesController } from '../modules/workspace-availabilities/workspace-availabilities.controller';
import { replaceWorkspaceAvailabilitiesSchema } from '../schemas/workspace-availability.schema';

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

router.get(
  '/availability',
  authenticate,
  authorize('owner'),
  workspaceAvailabilitiesController.get,
);
router.put(
  '/availability',
  authenticate,
  authorize('owner'),
  validateRequest(replaceWorkspaceAvailabilitiesSchema),
  workspaceAvailabilitiesController.replace,
);

export default router;
