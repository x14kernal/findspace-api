import countries from 'world-countries';
import type { Char, Varchar } from '@prisma/orm-postgres/target/codec-types';
import { db } from './db';

const EXCLUDED = new Set(['IL']);
const CURRENCY_OVERRIDE: Record<string, string> = { PS: 'ILS' };

function toRow(c: (typeof countries)[number]) {
  if (EXCLUDED.has(c.cca2)) return null;

  const currencyCode = CURRENCY_OVERRIDE[c.cca2] ?? Object.keys(c.currencies)[0];
  const { root, suffixes } = c.idd;
  if (!currencyCode || !root) return null;

  return {
    name: c.name.common,
    iso2Code: c.cca2 as Char<2>,
    iso3Code: c.cca3 as Char<3>,
    currencyCode: currencyCode as Char<3>,
    phoneCode: (suffixes.length === 1 ? root + suffixes[0] : root) as Varchar<6>,
  };
}

async function main() {
  console.log('Seeding:', new URL(process.env.DATABASE_URL!).host);

  const existing = new Set((await db.orm.public.Country.all()).map((c) => c.iso2Code));

  const rows = countries.flatMap((c) => {
    const row = toRow(c);
    return row && !existing.has(row.iso2Code) ? [row] : [];
  });

  if (rows.length) await db.orm.public.Country.createAndCount(rows);
  console.log(`Added: ${rows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.close());
