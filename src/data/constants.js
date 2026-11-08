// Shared lists of allowed values.
// Import these instead of typing the strings by hand, so every page uses the same values.
// `value` is what gets saved in the data, `label` is what users see.

// TODO: replace with the regions the team agrees on.
export const REGIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'central', label: 'Central' },
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
