// Shared lists of allowed values.

// Lebanon's 8 governorates (muhafazat).
export const REGIONS = [
  { value: 'beirut', label: 'Beirut' },
  { value: 'mount-lebanon', label: 'Mount Lebanon' },
  { value: 'north', label: 'North' },
  { value: 'akkar', label: 'Akkar' },
  { value: 'beqaa', label: 'Beqaa' },
  { value: 'baalbek-hermel', label: 'Baalbek-Hermel' },
  { value: 'south', label: 'South' },
  { value: 'nabatieh', label: 'Nabatieh' },
];

export const SPECIES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'bird', label: 'Bird' },
  { value: 'other', label: 'Other' },
];

export const SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const ROLES = [
  { value: 'adopter', label: 'I want to adopt' },
  { value: 'shelter', label: "I'm a shelter" },
];

// Age filter groups, by age in whole months (min and max are inclusive).
export const AGE_GROUPS = [
  { value: 'baby', label: 'Baby (under 1 year)', min: 0, max: 11 },
  { value: 'young', label: 'Young (1–2 years)', min: 12, max: 35 },
  { value: 'adult', label: 'Adult (3–7 years)', min: 36, max: 95 },
  { value: 'senior', label: 'Senior (8+ years)', min: 96, max: Infinity },
];

// Shown for a shelter that hasn't listed its own opening hours.
export const DEFAULT_OPENING_HOURS = ['Every day: 09:00–19:00'];

export const PET_STATUS = ['available', 'pending', 'adopted'];
export const REQUEST_STATUS = ['pending', 'approved', 'rejected'];
