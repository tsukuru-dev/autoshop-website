// Provisional branding and service list: confirm with the garage before launch.
export const site = {
  name: 'FJD Autos',
  email: '',
  phone: '',
  address: '',
};

export const services = [
  { slug: 'servicing', name: 'Servicing', short: 'Keep your next journey running smoothly.', description: 'Tell us about your vehicle, its mileage and when it was last serviced. We can discuss the work it needs and arrange a suitable time.' },
  { slug: 'repairs', name: 'Repairs', short: 'Get to the bottom of that knock, rattle or fault.', description: 'Describe the problem and when it happens. Include any recent repairs or changes to help us understand what needs attention.' },
  { slug: 'diagnostics', name: 'Diagnostics', short: 'A clearer picture of what’s going on.', description: 'Have a warning light or an intermittent problem? Let us know what you have noticed and which warning messages are showing.' },
] as const;
