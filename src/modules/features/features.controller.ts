import type { Request, Response } from 'express';
import { sendSuccess } from '../../responses/response-helpers';
import { SUCCESS_CODES } from '../../i18n';
import { toFeaturesResponse } from './features.mapper';
import { featuresService } from './features.service';

export const featuresController = {
  async getAll(_: Request, res: Response) {
    const features = await featuresService.getAll();
    sendSuccess(res, toFeaturesResponse(features), {
      status: 200,
      code: SUCCESS_CODES.FEATURES_FETCHED,
    });
  },
};
