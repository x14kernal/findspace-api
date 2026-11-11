export type Country = {
  id: string;
  name: string;
  iso2Code: string;
  iso3Code: string;
  currencyCode: string;
  phoneCode: string;
  createdAt: Date;
};

export type NewCountry = Omit<Country, 'id' | 'createdAt'>;

export type CountryResponse = Pick<
  Country,
  'id' | 'name' | 'iso2Code' | 'iso3Code' | 'currencyCode' | 'phoneCode'
>;
