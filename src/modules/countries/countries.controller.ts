import type { Request, Response } from 'express';
import { countriesService } from './countries.service';
import { sendSuccess } from '../../responses/response-helpers';
import { toCountriesResponse } from './countries.mapper';
import { SUCCESS_CODES } from '../../i18n';

export const countriesController = {
  async getAll(_: Request, res: Response) {
    const countries = await countriesService.getAll();
    res.set('Cache-Control', 'public, max-age=86400');
    sendSuccess(res, toCountriesResponse(countries), {
      status: 200,
      code: SUCCESS_CODES.COUNTRIES_FETCH_SUCCESS,
    });
  },
};
