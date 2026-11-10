import { DEFAULT_OPENING_HOURS } from './constants.js';

// Always pass the CURRENT shared-state arrays, rather than importing seed arrays.
export const getFeaturedPets = (pets) =>
  pets.filter((pet) => pet.isFeatured && pet.status === 'available');

export const getPetsByOwner = (pets, ownerId) =>
  pets.filter((pet) => pet.ownerId === ownerId);

export const getPetsByShelter = (pets, shelterId) =>
  pets.filter((pet) => shelterId != null && pet.shelterId === shelterId);

export const getRequestsByAdopter = (requests, adopterId) =>
  requests.filter((request) => request.adopterId === adopterId);

export function getIncomingRequests(requests, pets, ownerId) {
  const ownedPetIds = new Set(getPetsByOwner(pets, ownerId).map((pet) => pet.id));
  return requests.filter((request) => ownedPetIds.has(request.petId));
}

export function getPetAgeLabel(ageMonths) {
  if (!Number.isInteger(ageMonths) || ageMonths < 0) return 'Age unknown';
  if (ageMonths < 12) return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`;
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const yearLabel = `${years} year${years === 1 ? '' : 's'}`;
  return months ? `${yearLabel} ${months} month${months === 1 ? '' : 's'}` : yearLabel;
}

// A shelter's opening hours, or 09:00–19:00 every day when it hasn't listed any.
export const getOpeningHours = (shelter) =>
  shelter.openingHours?.length ? shelter.openingHours : DEFAULT_OPENING_HOURS;

// Split "Monday–Friday: 10:00–17:00" into ["Monday–Friday", "10:00–17:00"].
export function splitHours(line) {
  const index = line.indexOf(': ');
  return index === -1 ? [line, ''] : [line.slice(0, index), line.slice(index + 2)];
}

// Turn 24-hour times into 12-hour ones: "10:00–17:00" → "10 AM – 5 PM".
// Words like "Closed" or "By appointment" are left as they are.
export function formatHours12h(time) {
  return time
    .replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => {
      const hour = Number(h);
      const suffix = hour < 12 ? 'AM' : 'PM';
      const hour12 = hour % 12 || 12; // 0 → 12 AM, 12 → 12 PM
      return m === '00' ? `${hour12} ${suffix}` : `${hour12}:${m} ${suffix}`;
    })
    .replace(/\s*[–-]\s*/g, ' – ');
}
