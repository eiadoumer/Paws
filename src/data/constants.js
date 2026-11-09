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

export const PET_STATUS = ['available', 'pending', 'adopted'];
export const REQUEST_STATUS = ['pending', 'approved', 'rejected'];
