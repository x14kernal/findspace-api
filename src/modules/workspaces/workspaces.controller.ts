import type { Request, Response } from 'express';
import { workspacesService } from './workspaces.service';
import { sendSuccess } from '../../responses/response-helpers';
import { toWorkspaceResponse } from './workspaces.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const workspacesController = {
  async getMine(req: Request, res: Response) {
    const data = await workspacesService.getByOwnerOrThrow(req.user!.id);
    sendSuccess(res, toWorkspaceResponse(data), {
      status: 200,
      code: SUCCESS_CODES.WORKSPACE_FETCHED,
    });
  },
  async create(req: Request, res: Response) {
    const data = await workspacesService.createForOwner(req.user!.id, req.body);
    sendSuccess(res, toWorkspaceResponse(data), {
      status: 201,
      code: SUCCESS_CODES.WORKSPACE_CREATED,
    });
  },
  async update(req: Request, res: Response) {
    const data = await workspacesService.updateForOwner(req.user!.id, req.body);
    sendSuccess(res, toWorkspaceResponse(data), {
      status: 200,
      code: SUCCESS_CODES.WORKSPACE_UPDATED,
    });
  },
};
