// Business details transcribed from the existing website screenshot.
// Email was not visible; do not invent it.
export const site = {
  name: 'FJD Autos',
  email: '',
  phone: '020 8390 2542',
  phoneHref: 'tel:+442083902542',
  locality: 'Surbiton',
  openingHoursSummary: 'Monday–Friday · 7am–5.30pm',
  openingHours: [
    { days: 'Monday', hours: '7am–5.30pm' },
    { days: 'Tuesday', hours: '7am–5.30pm' },
    { days: 'Wednesday', hours: '7am–5.30pm' },
    { days: 'Thursday', hours: '7am–5.30pm' },
    { days: 'Friday', hours: '7am–5.30pm' },
    { days: 'Saturday', hours: 'Closed' },
    { days: 'Sunday', hours: 'Closed' },
  ],
  address: '134 Tolworth Broadway, Surbiton, Surrey, KT6 7HT',
  areasServed: ['Surbiton', 'Tolworth', 'New Malden', 'Worcester Park', 'Epsom & Ewell', 'Esher', 'Kingston', 'Hampton', 'Walton-on-Thames', 'East & West Molesey'],
};

export const services = [
  { slug: 'mot', name: 'MOTs', short: 'Time for your next MOT? Let’s get it arranged.', description: 'FJD Autos offers MOT testing in Surbiton for all makes and models. Send your registration and preferred date, and we’ll contact you to confirm availability.' },
  { slug: 'tyres', name: 'Tyres', short: 'Find the right tyres for the road ahead.', description: 'Ask FJD Autos for a free, no-obligation tyre quote. Include your registration and tyre size if you know it, and tell us how many tyres you need.' },
  { slug: 'servicing', name: 'Servicing', short: 'Keep your next journey running smoothly.', description: 'Tell us about your vehicle, its mileage and when it was last serviced. We can discuss the work it needs and arrange a suitable time.' },
  { slug: 'repairs', name: 'Repairs', short: 'Get to the bottom of that knock, rattle or fault.', description: 'Describe the problem and when it happens. Include any recent repairs or changes to help us understand what needs attention.' },
  { slug: 'diagnostics', name: 'Diagnostics', short: 'A clearer picture of what’s going on.', description: 'Have a warning light or an intermittent problem? Let us know what you have noticed and which warning messages are showing.' },
] as const;
