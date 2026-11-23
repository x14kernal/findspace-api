import type { Request, Response } from 'express';
import { workspaceAvailabilitiesService } from './workspace-availabilities.service';
import { sendSuccess } from '../../responses/response-helpers';
import { toWorkspaceAvailabilitiesResponse } from './workspace-availabilities.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const workspaceAvailabilitiesController = {
  async get(req: Request, res: Response) {
    const data = await workspaceAvailabilitiesService.getOrThrow(req.user!.id);
    sendSuccess(res, toWorkspaceAvailabilitiesResponse(data), {
      status: 200,
      code: SUCCESS_CODES.WORKSPACE_AVAILABILITY_FETCHED,
    });
  },

  async replace(req: Request, res: Response) {
    const data = await workspaceAvailabilitiesService.replaceForOwner(req.user!.id, req.body);
    sendSuccess(res, toWorkspaceAvailabilitiesResponse(data), {
      status: 200,
      code: SUCCESS_CODES.WORKSPACE_AVAILABILITY_UPDATED,
    });
  },
};
