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
