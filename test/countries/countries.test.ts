import { describe, expect, it, vi } from 'vitest';
import app from '../../src/app';
import request from 'supertest';
import { GET_COUNTRIES_PATH } from '../constants';
import { SUCCESS_CODES } from '../../src/i18n';
import { countriesRepository } from '../../src/modules/countries/countries.repository';

describe('Get /countries', () => {
  it('returns 200 with countries list', async () => {
    const res = await request(app).get(GET_COUNTRIES_PATH);
    const countries = res.body.data;

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.COUNTRIES_FETCH_SUCCESS);
    expect(countries.length).toBeGreaterThan(200);
    expect(Object.keys(countries[0]).sort()).toEqual([
      'currencyCode',
      'id',
      'iso2Code',
      'iso3Code',
      'name',
      'phoneCode',
    ]);
    const names = countries.map((c: { name: string }) => c.name);
    expect(names.indexOf('Afghanistan')).toBeLessThan(names.indexOf('Egypt'));
    expect(names.indexOf('Egypt')).toBeLessThan(names.indexOf('Zimbabwe'));
    expect(res.headers['cache-control']).toBe('public, max-age=86400');
  });

  it('returns 200 with empty list', async () => {
    vi.spyOn(countriesRepository, 'getAll').mockResolvedValueOnce([]);

    const res = await request(app).get(GET_COUNTRIES_PATH);
    const countries = res.body.data;

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe(SUCCESS_CODES.COUNTRIES_FETCH_SUCCESS);
    expect(countries.length).toBe(0);
  });
});
