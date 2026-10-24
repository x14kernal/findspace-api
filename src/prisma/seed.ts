import { randomUUID as uuid } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { all } from '@prisma/orm-postgres/orm-client';
import { db } from './db'; // loads the Temporal polyfill (if you added it) before any Temporal use below
import type { Char, Numeric, Varchar } from '@prisma/orm-postgres/target/codec-types';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const PASSWORD = 'Password123!';
const MIN = 60_000;
const DAYS = 24 * 60; // minutes in a day

/** Placeholder for any image URL: a tiny description of what the image should show. */
const img = (description: string) => `[IMAGE: ${description}]`;

const instant = (d: Date): Date => d;
const plainDate = (d: Date): string => d.toISOString().slice(0, 10);
const plainTime = (hhmm: string): string => hhmm;

const minutesAgo = (m: number) => new Date(Date.now() - m * MIN);
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * MIN);
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

/**
 * Next occurrence of an ISO weekday (1=Mon … 7=Sun), strictly after today.
 * weekOffset shifts by whole weeks (negative = past).
 */
function nextDate(isoDow: number, weekOffset = 0): Date {
  const current = today.getUTCDay() === 0 ? 7 : today.getUTCDay();
  const diff = (isoDow - current + 7) % 7 || 7;
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() + diff + weekOffset * 7);
  return d;
}

// native_enum DayOfWeek stores "1".."7" (1 = Monday … 7 = Sunday)
type Dow = '1' | '2' | '3' | '4' | '5' | '6' | '7';
const dow = (isoDow: number) => String(isoDow) as Dow;

type Role = 'customer' | 'owner' | 'admin';
type WsStatus = 'active' | 'inactive';
type BkStatus = 'pending' | 'confirmed' | 'cancelled';

// -----------------------------------------------------------------------------
// Geography (Decimal / Numeric columns take plain strings)
// -----------------------------------------------------------------------------
const country = {
  eg: {
    id: uuid(),
    name: 'Egypt',
    iso2Code: 'EG' as Char<2>,
    iso3Code: 'EGY' as Char<3>,
    currencyCode: 'EGP' as Char<3>,
    phoneCode: '+20' as Varchar<6>,
  },
  sa: {
    id: uuid(),
    name: 'Saudi Arabia',
    iso2Code: 'SA' as Char<2>,
    iso3Code: 'SAU' as Char<3>,
    currencyCode: 'SAR' as Char<3>,
    phoneCode: '+966' as Varchar<6>,
  },
  ae: {
    id: uuid(),
    name: 'United Arab Emirates',
    iso2Code: 'AE' as Char<2>,
    iso3Code: 'ARE' as Char<3>,
    currencyCode: 'AED' as Char<3>,
    phoneCode: '+971' as Varchar<6>,
  },
};

const loc = {
  nasrCity: {
    id: uuid(),
    c: 'eg',
    city: 'Cairo',
    area: 'Nasr City',
    longitude: '31.3300',
    latitude: '30.0561',
  },
  maadi: {
    id: uuid(),
    c: 'eg',
    city: 'Cairo',
    area: 'Maadi',
    longitude: '31.2570',
    latitude: '29.9602',
  },
  dokki: {
    id: uuid(),
    c: 'eg',
    city: 'Giza',
    area: 'Dokki',
    longitude: '31.2000',
    latitude: '30.0381',
  },
  smouha: {
    id: uuid(),
    c: 'eg',
    city: 'Alexandria',
    area: 'Smouha',
    longitude: '29.9440',
    latitude: '31.2156',
  },
  olaya: {
    id: uuid(),
    c: 'sa',
    city: 'Riyadh',
    area: 'Olaya',
    longitude: '46.6753',
    latitude: '24.6935',
  },
  businessBay: {
    id: uuid(),
    c: 'ae',
    city: 'Dubai',
    area: 'Business Bay',
    longitude: '55.2650',
    latitude: '25.1850',
  },
} as const;
type LocKey = keyof typeof loc;

// -----------------------------------------------------------------------------
// Users + profiles
// -----------------------------------------------------------------------------
const userSeeds: Array<{
  key: string;
  email: string;
  role: Role;
  google?: string;
  first: string;
  last: string;
  loc: LocKey;
  phone: string;
  bio?: string;
  avatar?: string;
  neverLoggedIn?: boolean;
}> = [
  {
    key: 'admin',
    email: 'admin@findspace.example.com',
    role: 'admin',
    first: 'Ali',
    last: 'Farouk',
    loc: 'nasrCity',
    phone: '+201000000001',
    bio: 'Platform administrator.',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDiSnAAp62yvpvfVMqCADssv2Io73huotGGgjppfGZi_hISSFWt3APIwM',
  },
  // Owners (one workspace each)
  {
    key: 'owner1',
    email: 'omar.hassan@example.com',
    role: 'owner',
    first: 'Omar',
    last: 'Hassan',
    loc: 'nasrCity',
    phone: '+201001112221',
    bio: 'Founder of The Hive Coworking.',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfVxQ4dznwaKtuJ-KriB0enAQm4go2Dbu9SbijOcXpwZ3GBxmYm_5D3UlB',
  },
  {
    key: 'owner2',
    email: 'salma.adel@example.com',
    role: 'owner',
    first: 'Salma',
    last: 'Adel',
    loc: 'maadi',
    phone: '+201001112222',
    bio: 'Runs Nile Nest in Maadi.',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfOWyF67tsY5FhdMnnh-KqS56gfmzoU_05DOMm4Fatg',
  },
  {
    key: 'owner3',
    email: 'karim.mansour@example.com',
    role: 'owner',
    first: 'Karim',
    last: 'Mansour',
    loc: 'smouha',
    phone: '+201001112223',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt9kniJ4jWQVRfLtgCEO-U_c19ir3AjKv9A__Bdc0xNBUtkNfj4V-zTsI',
  },
  {
    key: 'owner4',
    email: 'fahad.alharbi@example.com',
    role: 'owner',
    first: 'Fahad',
    last: 'Alharbi',
    loc: 'olaya',
    phone: '+966501112224',
    bio: 'Owner of Olaya Hub (currently closed).',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWJupXYNg-BcbZ1n8wG7kXrWPNH8hdq_yIb03K9sm6ZQ',
  },
  // Customers
  {
    key: 'youssef',
    email: 'youssef.ibrahim@example.com',
    role: 'customer',
    first: 'Youssef',
    last: 'Ibrahim',
    loc: 'nasrCity',
    phone: '+201012345671',
    bio: 'Freelance product designer.',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ2CtkZzi1FIYu17AiHi3i6B96cWaM7V92pDvzDFYQr7_Mrgh5jAG91SUN',
  },
  {
    key: 'nour',
    email: 'nour.khaled@example.com',
    role: 'customer',
    google: 'google-oauth-109876543210',
    first: 'Nour',
    last: 'Khaled',
    loc: 'dokki',
    phone: '+201012345672',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQHQ2ECp8DTxGzG0YzGMqQpxME7aEALMB9p4CcAskteLGBcY-gloiBrv4',
  },
  {
    key: 'mariam',
    email: 'mariam.sami@example.com',
    role: 'customer',
    first: 'Mariam',
    last: 'Sami',
    loc: 'maadi',
    phone: '+201012345673',
    bio: 'Runs workshops and small training sessions.',
  },
  {
    key: 'ahmed',
    email: 'ahmed.fathy@example.com',
    role: 'customer',
    first: 'Ahmed',
    last: 'Fathy',
    loc: 'smouha',
    phone: '+201012345674',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVEXQjlQwsaRFRm-SUfD1PmEba3v2e9HR5cC92SOcQYQ',
  },
  {
    key: 'laila',
    email: 'laila.nabil@example.com',
    role: 'customer',
    first: 'Laila',
    last: 'Nabil',
    loc: 'businessBay',
    phone: '+971501234575',
    bio: 'Remote developer, visiting Egypt often.',
  },
  {
    key: 'hassan',
    email: 'hassan.tarek@example.com',
    role: 'customer',
    first: 'Hassan',
    last: 'Tarek',
    loc: 'olaya',
    phone: '+966501234576',
    neverLoggedIn: true,
  },
];
const users = userSeeds.map((u) => ({ ...u, id: uuid() }));
const uid = (key: string) => users.find((u) => u.key === key)!.id;
const phoneOf = (key: string) => users.find((u) => u.key === key)!.phone;

// -----------------------------------------------------------------------------
// Workspaces
// -----------------------------------------------------------------------------
type Schedule = Array<[days: number[], open: string, close: string]>;
const wsSeeds: Array<{
  key: string;
  owner: string;
  loc: LocKey;
  name: string;
  slug: string;
  description: string;
  floorCount: number;
  status: WsStatus;
  timezone: string;
  schedule: Schedule;
  images: Array<[alt: string, primary?: boolean]>;
}> = [
  {
    key: 'hive',
    owner: 'owner1',
    loc: 'nasrCity',
    name: 'The Hive Coworking',
    slug: 'the-hive-coworking',
    description:
      'A busy three-floor coworking building with meeting rooms, focus pods and a podcast studio.',
    floorCount: 3,
    status: 'active',
    timezone: 'Africa/Cairo' as Varchar<50>,
    schedule: [[[6, 7, 1, 2, 3, 4], '08:00', '22:00']], // closed Fridays
    images: [
      [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ-CAOed94nsLgLAGZ84KsJwDs6SYo9OJaFOtTtn1ICw',
        true,
      ],
      [
        'https://images.squarespace-cdn.com/content/v1/64dce5da1479b9308e984b57/e2c1ba04-c95f-497d-a5c4-07c1125afb10/04_MAGAZZINO+HEADQUARTERS_WILLIAM+MULVIHILL.jpg',
      ],
      [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-2GBgT2YnwmVv9SjXUkZIx78JfIkrVELrnVgBso7ULQ',
      ],
    ],
  },
  {
    key: 'nile',
    owner: 'owner2',
    loc: 'maadi',
    name: 'Nile Nest',
    slug: 'nile-nest',
    description: 'A calm villa-style workspace in Maadi with a garden and quiet rooms.',
    floorCount: 2,
    status: 'active',
    timezone: 'Africa/Cairo' as Varchar<50>,
    schedule: [
      [[6, 7, 1, 2, 3, 4], '09:00', '21:00'],
      [[5], '14:00', '20:00'], // short Friday
    ],
    images: [
      [
        'https://media.vrbo.com/lodging/35000000/34720000/34720000/34719998/24b947ee.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill',
        true,
      ],
      [
        'https://images.sofology.co.uk/image/upload/f_auto,q_auto/v1771514324/Bloomreach/blog/blog-livingideas-curved-date-desktop.jpg',
      ],
      [
        'https://info.southwestsolutions.com/hubfs/SouthwestSolutionsGroupWebsite/Furniture/Training-Room-Tables/training-room-tables-with-projector-screen.jpg',
      ],
    ],
  },
  {
    key: 'smouha',
    owner: 'owner3',
    loc: 'smouha',
    name: 'Smouha Studio',
    slug: 'smouha-studio',
    description: "Bright studio-style rooms close to Alexandria's Smouha district, open every day.",
    floorCount: 1,
    status: 'active',
    timezone: 'Africa/Cairo' as Varchar<50>,
    schedule: [[[1, 2, 3, 4, 5, 6, 7], '10:00', '20:00']],
    images: [
      [
        'https://img.peerspace.com/image/upload/f_auto,q_auto,dpr_auto,w_3840/hbimae8c3kqxn28qh6kv',
        true,
      ],
      [
        'https://cdn.thecoolist.com/wp-content/uploads/2025/05/Symmetry-for-Two-Small-Home-Office.jpg',
      ],
    ],
  },
  {
    key: 'olaya',
    owner: 'owner4',
    loc: 'olaya',
    name: 'Olaya Hub',
    slug: 'olaya-hub',
    description: "Executive meeting rooms in Riyadh's Olaya district. Temporarily inactive.",
    floorCount: 2,
    status: 'inactive',
    timezone: 'Asia/Riyadh' as Varchar<50>,
    schedule: [[[7, 1, 2, 3, 4], '09:00', '23:00']],
    images: [
      ['https://static4.superimoti.bg/property-images/big/1787838398T142019_9.jpg', true],
      ['https://mrbiguae.com/cdn/shop/files/6859A-BEG-scene1.jpg?v=1784959032&width=1946'],
    ],
  },
];
const workspaces = wsSeeds.map((w) => ({ ...w, id: uuid() }));
const wid = (key: string) => workspaces.find((w) => w.key === key)!.id;

// -----------------------------------------------------------------------------
// Features
// -----------------------------------------------------------------------------
const featureSeeds = [
  {
    slug: 'wifi',
    name: 'High-speed Wi-Fi',
    iconName: 'wifi',
    description: 'Fibre connection, shared network.',
  },
  {
    slug: 'projector',
    name: 'Projector',
    iconName: 'projector',
    description: 'HDMI / wireless projector.',
  },
  { slug: 'whiteboard', name: 'Whiteboard', iconName: 'presentation', description: null },
  { slug: 'air-conditioning', name: 'Air conditioning', iconName: 'snowflake', description: null },
  {
    slug: 'video-conferencing',
    name: 'Video conferencing',
    iconName: 'video',
    description: 'Camera, speaker and microphone set.',
  },
  { slug: 'coffee-tea', name: 'Free coffee & tea', iconName: 'coffee', description: null },
  { slug: 'printer', name: 'Printer access', iconName: 'printer', description: null },
  { slug: 'soundproof', name: 'Soundproof walls', iconName: 'volume-x', description: null },
  { slug: 'tv-screen', name: 'Smart TV screen', iconName: 'tv', description: null },
  {
    slug: 'recording-gear',
    name: 'Recording equipment',
    iconName: 'mic',
    description: 'Mics, mixer and headphones.',
  },
  { slug: 'standing-desk', name: 'Standing desk', iconName: 'monitor', description: null },
];
const features = featureSeeds.map((f) => ({ ...f, id: uuid() }));
const fid = (slug: string) => features.find((f) => f.slug === slug)!.id;

// -----------------------------------------------------------------------------
// Rooms
// (prices are in the workspace country's currency; floor <= workspace.floorCount;
//  `hours` optionally narrows the workspace hours for that room)
// -----------------------------------------------------------------------------
type FeatureRef = [slug: string, details?: string];
const roomSeeds: Array<{
  key: string;
  ws: string;
  code: string;
  name: string | null;
  description: string | null;
  price: string;
  capacity: number;
  floor: number;
  width: string;
  length: string;
  hours?: [string, string];
  features: FeatureRef[];
}> = [
  // The Hive (EGP)
  {
    key: 'hiveFocus',
    ws: 'hive',
    code: 'H-101',
    name: 'Focus Pod',
    description: 'A private pod for solo deep work.',
    price: '60.00',
    capacity: 1,
    floor: 1,
    width: '2.50',
    length: '2.00',
    features: [['wifi'], ['soundproof'], ['standing-desk', 'Electric, height-adjustable']],
  },
  {
    key: 'hiveBrainstorm',
    ws: 'hive',
    code: 'H-102',
    name: 'Brainstorm Room',
    description: 'Wall-to-wall whiteboards for team sessions.',
    price: '180.00',
    capacity: 6,
    floor: 1,
    width: '4.50',
    length: '4.00',
    features: [
      ['wifi'],
      ['whiteboard', 'Three walls, markers provided'],
      ['tv-screen', '55" screen with HDMI'],
      ['air-conditioning'],
    ],
  },
  {
    key: 'hiveBoard',
    ws: 'hive',
    code: 'H-201',
    name: 'Boardroom',
    description: 'Formal boardroom for client meetings.',
    price: '350.00',
    capacity: 12,
    floor: 2,
    width: '7.00',
    length: '5.00',
    features: [
      ['wifi'],
      ['projector', '4K, wireless casting'],
      ['video-conferencing'],
      ['air-conditioning'],
      ['coffee-tea'],
    ],
  },
  {
    key: 'hivePodcast',
    ws: 'hive',
    code: 'H-301',
    name: 'Podcast Studio',
    description: 'Acoustically treated room for recording.',
    price: '250.00',
    capacity: 4,
    floor: 3,
    width: '4.00',
    length: '3.50',
    hours: ['10:00', '20:00'],
    features: [['recording-gear', '4 mics + mixer'], ['soundproof'], ['air-conditioning']],
  },
  // Nile Nest (EGP)
  {
    key: 'nileGarden',
    ws: 'nile',
    code: 'N-101',
    name: 'Garden Room',
    description: 'Opens onto the garden, great for small teams.',
    price: '150.00',
    capacity: 4,
    floor: 1,
    width: '4.00',
    length: '3.50',
    features: [['wifi'], ['whiteboard'], ['coffee-tea', 'Unlimited, self-serve']],
  },
  {
    key: 'nileCabin',
    ws: 'nile',
    code: 'N-102',
    name: 'Quiet Cabin',
    description: 'Small and silent, ideal for calls.',
    price: '90.00',
    capacity: 2,
    floor: 1,
    width: '3.00',
    length: '2.50',
    features: [['wifi'], ['soundproof'], ['video-conferencing']],
  },
  {
    key: 'nileTraining',
    ws: 'nile',
    code: 'N-201',
    name: 'Training Hall',
    description: 'Large hall for workshops and trainings.',
    price: '400.00',
    capacity: 20,
    floor: 2,
    width: '8.00',
    length: '6.00',
    features: [['wifi'], ['projector'], ['air-conditioning'], ['printer', 'Black & white, A4']],
  },
  // Smouha Studio (EGP)
  {
    key: 'smouhaA',
    ws: 'smouha',
    code: 'S-101',
    name: 'Studio A',
    description: 'Bright studio with seating for eight.',
    price: '200.00',
    capacity: 8,
    floor: 1,
    width: '5.00',
    length: '4.50',
    features: [['wifi'], ['tv-screen'], ['whiteboard'], ['air-conditioning']],
  },
  {
    key: 'smouhaB',
    ws: 'smouha',
    code: 'S-102',
    name: 'Studio B',
    description: null,
    price: '110.00',
    capacity: 3,
    floor: 1,
    width: '3.50',
    length: '3.00',
    features: [['wifi'], ['air-conditioning']],
  },
  // Olaya Hub (SAR)
  {
    key: 'olayaExec',
    ws: 'olaya',
    code: 'O-101',
    name: 'Executive Suite',
    description: 'Private suite with skyline view.',
    price: '220.00',
    capacity: 8,
    floor: 1,
    width: '5.50',
    length: '4.50',
    features: [['wifi'], ['video-conferencing'], ['coffee-tea'], ['air-conditioning']],
  },
  {
    key: 'olayaMeet',
    ws: 'olaya',
    code: 'O-201',
    name: 'Open Meeting Room',
    description: null,
    price: '280.00',
    capacity: 10,
    floor: 2,
    width: '6.50',
    length: '5.00',
    features: [['wifi'], ['projector'], ['whiteboard']],
  },
  {
    key: 'olayaPod',
    ws: 'olaya',
    code: 'O-102',
    name: null,
    description: 'Unnamed phone booth.',
    price: '70.00',
    capacity: 1,
    floor: 1,
    width: '1.50',
    length: '1.50',
    features: [['soundproof']],
  },
  {
    key: 'olayaLab',
    ws: 'olaya',
    code: 'O-202',
    name: 'Workshop Lab',
    description: 'Flexible tables for workshops.',
    price: '300.00',
    capacity: 14,
    floor: 2,
    width: '7.50',
    length: '5.50',
    features: [['wifi'], ['projector'], ['printer']],
  },
];
const rooms = roomSeeds.map((r) => ({ ...r, id: uuid() }));
const rid = (key: string) => rooms.find((r) => r.key === key)!.id;
const roomOf = (key: string) => rooms.find((r) => r.key === key)!;
const ownerOfRoom = (key: string) => uid(wsSeeds.find((w) => w.key === roomOf(key).ws)!.owner);

// -----------------------------------------------------------------------------
// Bookings (1-hour slots, always inside the room's availability)
// -----------------------------------------------------------------------------
type Canceller = 'customer' | 'owner' | 'system';
const bookingSeeds: Array<{
  customer: string;
  room: string;
  date: Date;
  start: string;
  status: BkStatus;
  agoMin: number; // how long ago the booking was created
  cancelledBy?: Canceller;
  reason?: string;
}> = [
  // Upcoming confirmed
  {
    customer: 'youssef',
    room: 'hiveBrainstorm',
    date: nextDate(7),
    start: '10:00',
    status: 'confirmed',
    agoMin: 2 * DAYS,
  },
  {
    customer: 'mariam',
    room: 'hiveBoard',
    date: nextDate(1),
    start: '14:00',
    status: 'confirmed',
    agoMin: 1 * DAYS,
  },
  {
    customer: 'nour',
    room: 'hivePodcast',
    date: nextDate(3, 1),
    start: '15:00',
    status: 'confirmed',
    agoMin: 3 * DAYS,
  },
  {
    customer: 'mariam',
    room: 'smouhaB',
    date: nextDate(2, 1),
    start: '13:00',
    status: 'confirmed',
    agoMin: 5 * DAYS,
  },
  // Pending (still inside its hold window)
  {
    customer: 'ahmed',
    room: 'hiveFocus',
    date: nextDate(2),
    start: '09:00',
    status: 'pending',
    agoMin: 5,
  },
  // Cancelled: by customer, by owner, and by the system after the hold expired
  {
    customer: 'laila',
    room: 'nileGarden',
    date: nextDate(3),
    start: '11:00',
    status: 'cancelled',
    agoMin: 4 * DAYS,
    cancelledBy: 'customer',
    reason: 'Plans changed, meeting moved online.',
  },
  {
    customer: 'hassan',
    room: 'nileCabin',
    date: nextDate(4),
    start: '16:00',
    status: 'cancelled',
    agoMin: 6 * DAYS,
    cancelledBy: 'owner',
    reason: 'Room closed for maintenance.',
  },
  {
    customer: 'ahmed',
    room: 'smouhaA',
    date: nextDate(4),
    start: '12:00',
    status: 'cancelled',
    agoMin: 2 * DAYS,
    cancelledBy: 'system',
    reason: 'Hold expired before confirmation.',
  },
  // Past confirmed (history)
  {
    customer: 'youssef',
    room: 'smouhaA',
    date: nextDate(1, -1),
    start: '12:00',
    status: 'confirmed',
    agoMin: 10 * DAYS,
  },
  {
    customer: 'ahmed',
    room: 'nileTraining',
    date: nextDate(7, -1),
    start: '10:00',
    status: 'confirmed',
    agoMin: 12 * DAYS,
  },
  {
    customer: 'hassan',
    room: 'olayaExec',
    date: nextDate(7, -2),
    start: '10:00',
    status: 'confirmed',
    agoMin: 20 * DAYS,
  },
];

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed (and wipe) a production database.');
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const summary = await db.transaction(async (tx) => {
    const o = tx.orm.public;

    // --- Wipe (children first). where(() => all()) = "every row" ------------
    await o.Notification.where(() => all()).deleteAndCount();
    await o.Booking.where(() => all()).deleteAndCount();
    await o.RoomFeature.where(() => all()).deleteAndCount();
    await o.Feature.where(() => all()).deleteAndCount();
    await o.RoomUnavailability.where(() => all()).deleteAndCount();
    await o.RoomAvailability.where(() => all()).deleteAndCount();
    await o.Room.where(() => all()).deleteAndCount();
    await o.Image.where(() => all()).deleteAndCount();
    await o.WorkspaceAvailability.where(() => all()).deleteAndCount();
    await o.Workspace.where(() => all()).deleteAndCount();
    await o.Profile.where(() => all()).deleteAndCount();
    await o.User.where(() => all()).deleteAndCount();
    await o.Location.where(() => all()).deleteAndCount();
    await o.Country.where(() => all()).deleteAndCount();

    // --- Geography -----------------------------------------------------------
    await o.Country.createAndCount(Object.values(country));
    await o.Location.createAndCount(
      Object.values(loc).map((l) => ({
        id: l.id,
        countryId: country[l.c].id,
        city: l.city,
        area: l.area,
        longitude: l.longitude,
        latitude: l.latitude,
      })),
    );

    // --- Users + profiles ----------------------------------------------------
    await o.User.createAndCount(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        passwordHash: u.google ? null : passwordHash, // Google-only account has no password
        role: u.role,
        googleId: u.google ?? null,
        lastLoginAt: u.neverLoggedIn ? null : instant(minutesAgo(1 * DAYS)),
      })),
    );
    await o.Profile.createAndCount(
      users.map((u) => ({
        userId: u.id,
        firstName: u.first,
        lastName: u.last,
        locationId: loc[u.loc].id,
        bio: u.bio ?? null,
        avatarUrl: u.avatar ? img(u.avatar) : null, // placeholder instead of a real URL
        phoneNumber: u.phone,
      })),
    );

    // --- Workspaces ----------------------------------------------------------
    await o.Workspace.createAndCount(
      workspaces.map((w) => ({
        id: w.id,
        ownerId: uid(w.owner),
        locationId: loc[w.loc].id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        floorCount: w.floorCount,
        status: w.status,
        timezone: w.timezone as Varchar<50>,
      })),
    );
    await o.WorkspaceAvailability.createAndCount(
      workspaces.flatMap((w) =>
        w.schedule.flatMap(([days, open, close]) =>
          days.map((d) => ({
            workspaceId: w.id,
            dayOfWeek: dow(d),
            startAt: plainTime(open),
            endAt: plainTime(close),
          })),
        ),
      ),
    );
    await o.Image.createAndCount(
      workspaces.flatMap((w) =>
        w.images.map(([alt, primary]) => ({
          workspaceId: w.id,
          url: img(alt), // placeholder instead of a real URL
          altText: alt,
          isPrimary: primary === true, // at most one primary per workspace
        })),
      ),
    );

    // --- Features + rooms ----------------------------------------------------
    await o.Feature.createAndCount(features);
    await o.Room.createAndCount(
      rooms.map((r) => ({
        id: r.id,
        workspaceId: wid(r.ws),
        name: r.name,
        description: r.description,
        code: r.code as Varchar<25>,
        pricePerHour: r.price as Numeric<12, 2>,
        capacity: r.capacity,
        floorNumber: r.floor,
        widthM: r.width as Numeric<4, 2>,
        lengthM: r.length as Numeric<4, 2>,
      })),
    );

    // Room availability = workspace schedule, optionally narrowed by room.hours
    await o.RoomAvailability.createAndCount(
      rooms.flatMap((r) => {
        const ws = wsSeeds.find((w) => w.key === r.ws)!;
        return ws.schedule.flatMap(([days, open, close]) => {
          const start = r.hours && r.hours[0] > open ? r.hours[0] : open;
          const end = r.hours && r.hours[1] < close ? r.hours[1] : close;
          return days.map((d) => ({
            roomId: r.id,
            dayOfWeek: dow(d),
            startAt: plainTime(start),
            endAt: plainTime(end),
          }));
        });
      }),
    );

    await o.RoomUnavailability.createAndCount([
      {
        roomId: rid('hiveBoard'),
        dayDate: plainDate(nextDate(2)),
        startAt: plainTime('12:00'),
        endAt: plainTime('14:00'),
        reason: 'Private company event',
      },
      {
        roomId: rid('nileCabin'),
        dayDate: plainDate(nextDate(4)),
        startAt: plainTime('15:00'),
        endAt: plainTime('19:00'),
        reason: 'Maintenance',
      },
      {
        roomId: rid('nileGarden'),
        dayDate: plainDate(nextDate(6)),
        startAt: plainTime('09:00'),
        endAt: plainTime('21:00'),
        reason: 'Garden renovation',
      },
      {
        roomId: rid('smouhaB'),
        dayDate: plainDate(nextDate(5)),
        startAt: plainTime('10:00'),
        endAt: plainTime('12:00'),
        reason: null,
      },
    ]);

    await o.RoomFeature.createAndCount(
      rooms.flatMap((r) =>
        r.features.map(([slug, details]) => ({
          roomId: r.id,
          featureId: fid(slug),
          featureDetails: details ?? null,
        })),
      ),
    );

    // --- Bookings ------------------------------------------------------------
    const built = bookingSeeds.map((b) => {
      const createdAt = minutesAgo(b.agoMin);
      const confirmedAt = b.status === 'confirmed' ? addMinutes(createdAt, 10) : null;
      const cancelledAt =
        b.status === 'cancelled'
          ? addMinutes(createdAt, b.cancelledBy === 'system' ? 31 : 120)
          : null;
      const cancelledById =
        b.cancelledBy === 'customer'
          ? uid(b.customer)
          : b.cancelledBy === 'owner'
            ? ownerOfRoom(b.room)
            : null;
      return {
        seed: b,
        createdAt,
        confirmedAt,
        cancelledAt,
        row: {
          id: uuid(),
          roomId: rid(b.room),
          userId: uid(b.customer),
          date: plainDate(b.date),
          startAt: plainTime(b.start),
          customerPhoneNumber: phoneOf(b.customer),
          status: b.status,
          expiresAt: instant(addMinutes(createdAt, 30)), // hold window: 30 min after creation
          confirmedAt: confirmedAt ? instant(confirmedAt) : null,
          cancelledAt: cancelledAt ? instant(cancelledAt) : null,
          cancellationReason: b.reason ?? null,
          cancelledById,
          createdAt: instant(createdAt),
        },
      };
    });
    await o.Booking.createAndCount(built.map((x) => x.row));

    // --- Notifications ---------------------------------------------------------
    const notifications = built.flatMap(({ seed: b, row, createdAt, confirmedAt, cancelledAt }) => {
      const room = roomOf(b.room);
      const label = room.name ?? room.code;
      const date = isoDate(b.date);
      const data = {
        bookingId: row.id,
        roomId: row.roomId,
        roomName: label,
        date,
        startAt: b.start,
      };
      const owner = ownerOfRoom(b.room);
      const customer = uid(b.customer);
      const out: Array<{
        recipientId: string;
        type: string;
        message: string;
        data: typeof data;
        createdAt: Date;
        readAt: Date | null;
      }> = [];

      out.push({
        recipientId: owner,
        type: 'booking.created',
        message: `New booking request for ${label} on ${date} at ${b.start}.`,
        data,
        createdAt: instant(createdAt),
        readAt: b.status === 'pending' ? null : instant(addMinutes(createdAt, 30)),
      });
      if (b.status === 'confirmed' && confirmedAt) {
        out.push({
          recipientId: customer,
          type: 'booking.confirmed',
          message: `Your booking for ${label} on ${date} at ${b.start} is confirmed.`,
          data,
          createdAt: instant(confirmedAt),
          readAt: instant(addMinutes(confirmedAt, 20)),
        });
      }
      if (b.status === 'cancelled' && cancelledAt) {
        // Notify the party who did NOT cancel (the customer is told on owner/system cancels).
        out.push({
          recipientId: b.cancelledBy === 'customer' ? owner : customer,
          type: 'booking.cancelled',
          message:
            `Booking for ${label} on ${date} at ${b.start} was cancelled. ${b.reason ?? ''}`.trim(),
          data,
          createdAt: instant(cancelledAt),
          readAt: null,
        });
      }
      return out;
    });
    await o.Notification.createAndCount(notifications);

    return { bookings: built.length, notifications: notifications.length };
  });

  console.log('Seed complete.');
  console.log(`  users: ${users.length}, workspaces: ${workspaces.length}, rooms: ${rooms.length}`);
  console.log(`  bookings: ${summary.bookings}, notifications: ${summary.notifications}`);
  console.log(`  login with any seeded email (Google-only user excluded) + password: ${PASSWORD}`);
  console.log(`  admin: admin@findspace.example.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
