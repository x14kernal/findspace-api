import type { Country, CountryResponse } from '../../types/country.types';

export const toCountryResponse = ({
  id,
  name,
  iso2Code,
  iso3Code,
  currencyCode,
  phoneCode,
}: Country): CountryResponse => {
  return { id, name, iso2Code, iso3Code, currencyCode, phoneCode };
};

export const toCountriesResponse = (countries: Country[]): CountryResponse[] => {
  return countries.map((c) => toCountryResponse(c));
};
