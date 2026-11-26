import { db } from './db';

const FEATURES: [slug: string, name: string, description: string][] = [
  // Connectivity and tech
  ['wifi', 'Wi-Fi', 'Wireless internet access for all guests in the space.'],
  [
    'high-speed-internet',
    'High-speed internet',
    'Fast and stable internet, good for video calls and large file transfers.',
  ],
  [
    'ethernet-ports',
    'Ethernet ports',
    'Wired network ports for a faster and more stable connection.',
  ],
  [
    'power-outlets',
    'Power outlets',
    'Wall sockets within easy reach to power laptops and devices.',
  ],
  ['usb-charging', 'USB charging ports', 'Built-in USB ports to charge phones and tablets.'],
  [
    'wireless-charging',
    'Wireless charging',
    'Charging pads that power compatible phones without a cable.',
  ],
  ['projector', 'Projector', 'A projector to show slides, videos, and documents on a big surface.'],
  ['projector-screen', 'Projector screen', 'A screen for clear projected images.'],
  ['tv-screen', 'TV screen', 'A large screen for presentations, videos, and shared content.'],
  [
    'smart-tv',
    'Smart TV',
    'A TV with built-in apps and internet, ready for streaming and casting.',
  ],
  [
    'video-conferencing',
    'Video conferencing',
    'Equipment set up for video meetings with remote guests.',
  ],
  ['conference-phone', 'Conference phone', 'A speakerphone for clear group calls.'],
  ['webcam', 'Webcam', 'A camera for video calls and online meetings.'],
  ['speakers', 'Speakers', 'Audio speakers for presentations, music, and video.'],
  ['microphones', 'Microphones', 'Microphones so everyone in the room can be heard clearly.'],
  [
    'wireless-presentation',
    'Wireless presentation',
    'Share your screen to the display without any cables.',
  ],

  // Equipment
  ['whiteboard', 'Whiteboard', 'A wall-mounted board for writing, sketching, and brainstorming.'],
  ['flipchart', 'Flipchart', 'A large paper pad on a stand for notes and group exercises.'],
  ['markers', 'Markers and erasers', 'Markers and erasers for the whiteboard or flipchart.'],
  ['printer', 'Printer', 'A printer for documents and handouts.'],
  ['scanner', 'Scanner', 'A scanner to turn paper documents into digital files.'],
  ['photocopier', 'Photocopier', 'A copy machine for quick copies of documents.'],
  ['stationery', 'Stationery', 'Basic supplies such as pens, paper, and sticky notes.'],
  ['external-monitor', 'External monitor', 'An extra screen to connect to your laptop.'],
  [
    'docking-station',
    'Docking station',
    'Connect your laptop to a monitor, keyboard, and more with one cable.',
  ],
  ['hdmi-cable', 'HDMI cable', 'An HDMI cable to connect your laptop to the display.'],
  [
    'adapters-and-cables',
    'Adapters and cables',
    'Common adapters and cables for different laptops and phones.',
  ],
  [
    'presentation-clicker',
    'Presentation clicker',
    'A remote to change slides while you walk around the room.',
  ],
  ['lectern', 'Lectern', 'A stand for speakers to hold notes and a laptop.'],

  // Furniture
  [
    'ergonomic-chairs',
    'Ergonomic chairs',
    'Adjustable chairs that support your back during long sessions.',
  ],
  ['standing-desks', 'Standing desks', 'Desks that can be raised so you can work standing up.'],
  ['conference-table', 'Conference table', 'A large table that seats a full meeting group.'],
  ['round-table', 'Round table', 'A round table that helps everyone see and talk to each other.'],
  ['sofa', 'Sofa', 'A soft sofa for relaxed seating.'],
  ['lounge-seating', 'Lounge seating', 'Comfortable chairs for casual talks and breaks.'],
  ['bean-bags', 'Bean bags', 'Soft, flexible seats for a relaxed and informal setting.'],
  ['storage-lockers', 'Storage lockers', 'Lockable spaces to keep bags and personal items safe.'],
  ['coat-rack', 'Coat rack', 'A place to hang coats and jackets.'],
  ['bookshelf', 'Bookshelf', 'Shelves with books and reference materials.'],
  ['cabinets', 'Cabinets', 'Cabinets for storing supplies and equipment.'],

  // Climate and comfort
  ['air-conditioning', 'Air conditioning', 'Cooling to keep the space comfortable in hot weather.'],
  ['heating', 'Heating', 'Heating to keep the space warm in cold weather.'],
  ['natural-light', 'Natural light', 'Big windows that let in plenty of daylight.'],
  ['window-view', 'Window view', 'Windows with a pleasant view outside.'],
  [
    'blackout-curtains',
    'Blackout curtains',
    'Thick curtains that block out light for screens and videos.',
  ],
  [
    'adjustable-lighting',
    'Adjustable lighting',
    'Lights you can dim or brighten to fit the activity.',
  ],
  [
    'soundproofing',
    'Soundproofing',
    'Walls that reduce outside noise and keep your talks private.',
  ],
  ['ventilation', 'Ventilation', 'Good air flow to keep the air fresh.'],
  ['indoor-plants', 'Indoor plants', 'Plants that make the space feel fresh and calm.'],
  ['quiet-zone', 'Quiet zone', 'A calm area where noise is kept low for focused work.'],

  // Food and drink
  ['coffee', 'Coffee', 'Fresh coffee available for guests.'],
  ['tea', 'Tea', 'A selection of tea available for guests.'],
  ['drinking-water', 'Drinking water', 'Free drinking water for guests.'],
  ['water-dispenser', 'Water dispenser', 'A dispenser with cold, and often hot, water.'],
  ['kitchenette', 'Kitchenette', 'A small kitchen area for preparing drinks and light meals.'],
  ['refrigerator', 'Refrigerator', 'A fridge to keep food and drinks cold.'],
  ['microwave', 'Microwave', 'A microwave to heat up food.'],
  ['snacks', 'Snacks', 'Light snacks available for guests.'],
  ['catering', 'Catering available', 'Food and drinks can be arranged for your event.'],
  ['vending-machine', 'Vending machine', 'A machine with snacks and drinks for quick purchase.'],

  // Facilities
  ['parking', 'Parking', 'Parking spots for guests and visitors.'],
  ['bike-parking', 'Bicycle parking', 'A safe place to park and lock your bicycle.'],
  ['elevator', 'Elevator', 'An elevator for easy access to all floors.'],
  ['restrooms', 'Restrooms', 'Restrooms available for guests.'],
  ['prayer-room', 'Prayer room', 'A quiet room set aside for prayer.'],
  ['lounge-area', 'Lounge area', 'A shared area to relax, chat, or take a break.'],
  ['reception', 'Reception desk', 'Staffed front desk to welcome and help guests.'],
  ['waiting-area', 'Waiting area', 'A seating area for guests who arrive early.'],
  ['rooftop-terrace', 'Rooftop terrace', 'An open-air space on the roof with city views.'],
  ['garden', 'Garden', 'A green outdoor area for breaks and small gatherings.'],
  ['outdoor-seating', 'Outdoor seating', 'Seats outside for fresh air and informal talks.'],
  ['ev-charging', 'EV charging', 'Charging points for electric cars.'],

  // Security and access
  ['security-24-7', '24/7 security', 'Security staff on site at all times.'],
  ['cctv', 'CCTV', 'Camera monitoring for added safety.'],
  ['keycard-access', 'Keycard access', 'Entry with a keycard, so only approved people can enter.'],
  ['access-24-7', '24/7 access', 'You can enter the space at any time, day or night.'],
  ['fire-safety', 'Fire safety equipment', 'Fire alarms, extinguishers, and clear exit routes.'],
  ['first-aid-kit', 'First aid kit', 'A kit with basic supplies for minor injuries.'],
  ['secure-entry', 'Secure entry', 'Controlled entry points to keep the space safe.'],
  ['visitor-management', 'Visitor management', 'A check-in system to register and track visitors.'],

  // Accessibility
  [
    'wheelchair-accessible',
    'Wheelchair accessible',
    'The space can be reached and used with a wheelchair.',
  ],
  [
    'accessible-restroom',
    'Accessible restroom',
    'A restroom designed for people with limited mobility.',
  ],
  [
    'step-free-entrance',
    'Step-free entrance',
    'An entrance with no steps, such as a ramp or a flat path.',
  ],
  ['hearing-loop', 'Hearing loop', 'A system that sends sound straight to hearing aids.'],
  ['braille-signage', 'Braille signage', 'Signs with Braille for visually impaired guests.'],

  // Services
  ['cleaning-service', 'Cleaning service', 'The space is cleaned before and after your booking.'],
  ['tech-support', 'Technical support', 'Help on hand for tech problems during your booking.'],
  ['on-site-staff', 'On-site staff', 'Team members on site to help with your needs.'],
  ['mail-handling', 'Mail handling', 'Mail and packages are received and kept for you.'],
  ['event-setup', 'Event setup help', 'Staff help to set up the room for your event.'],
  [
    'interpretation-equipment',
    'Interpretation equipment',
    'Headsets and booths for live translation at multilingual events.',
  ],
  ['recording-equipment', 'Recording equipment', 'Gear to record audio or video of your session.'],
  ['live-streaming', 'Live streaming', 'Equipment to broadcast your event live online.'],

  // Specialty
  ['studio-lighting', 'Studio lighting', 'Professional lights for photos and video.'],
  ['green-screen', 'Green screen', 'A green backdrop to replace the background in video.'],
  ['sound-booth', 'Sound booth', 'A sound-treated booth for clean audio recording.'],
  [
    'podcasting-equipment',
    'Podcasting equipment',
    'Microphones and mixers ready for podcast recording.',
  ],
  ['3d-printer', '3D printer', 'A 3D printer for models and prototypes.'],

  // Other
  ['pet-friendly', 'Pet-friendly', 'Well-behaved pets are welcome in the space.'],
  ['nursing-room', 'Nursing room', 'A private and comfortable room for nursing parents.'],
];

async function main() {
  console.log('Seeding:', new URL(process.env.DATABASE_URL!).host);

  const existing = new Set((await db.orm.public.Feature.all()).map((f) => f.slug));

  const rows = FEATURES.flatMap(([slug, name, description]) =>
    existing.has(slug) ? [] : [{ slug, name, description }],
  );

  if (rows.length) await db.orm.public.Feature.createAndCount(rows);
  console.log(`Added: ${rows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.close());
