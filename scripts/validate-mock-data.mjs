import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mockUsers, mockShelters, mockPets, mockAdoptionRequests, createMockData, DEMO_USER_ID, DEMO_PASSWORD } from '../src/data/mockData.js';
import { SPECIES, SIZES, REGIONS, ROLES, PET_STATUS, REQUEST_STATUS } from '../src/data/constants.js';
import { getFeaturedPets, getPetsByOwner, getPetsByShelter, getRequestsByAdopter, getIncomingRequests, getPetAgeLabel } from '../src/data/selectors.js';

 
const users = new Map(mockUsers.map((item) => [item.id, item]));
const shelters = new Map(mockShelters.map((item) => [item.id, item]));
const pets = new Map(mockPets.map((item) => [item.id, item]));
const allowed = (options) => options.map((item) => item.value);
const textFields = (item, fields) => fields.forEach((field) => {
  assert.equal(typeof item[field], 'string', `${item.id}: ${field} must be a string`);
  assert.ok(item[field].trim(), `${item.id}: ${field} is empty`);
});
const validDates = (item) => {
  assert.ok(Number.isFinite(Date.parse(item.createdAt)), `${item.id}: invalid creation date`);
  if (item.updatedAt) assert.ok(Date.parse(item.updatedAt) >= Date.parse(item.createdAt), `${item.id}: update predates creation`);
};
const imageExists = (item) => {
  assert.ok(item.imageUrl.startsWith('/images/mock/'));
  const path = fileURLToPath(new URL(`../public${item.imageUrl}`, import.meta.url));
  assert.ok(existsSync(path), `${item.id}: missing local image ${path}`);
  const bytes = readFileSync(path);
  if (path.endsWith('.svg')) {
    assert.match(bytes.toString('utf8'), /<svg[\s>]/, `${item.id}: invalid SVG illustration`);
  } else if (path.endsWith('.webp')) {
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${item.id}: invalid WebP header`);
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${item.id}: invalid WebP format`);
  } else assert.fail(`${item.id}: unsupported bundled image format`);
};

for (const collection of [mockUsers, mockShelters, mockPets, mockAdoptionRequests]) {
  assert.equal(new Set(collection.map((item) => item.id)).size, collection.length, 'Duplicate ID');
  for (const item of collection) textFields(item, ['id']);
}
assert.equal(new Set(mockUsers.map((user) => user.email.trim().toLowerCase())).size, mockUsers.length, 'Duplicate login email');
for (const user of mockUsers) {
  textFields(user, ['name', 'email', 'password', 'phone', 'bio']);
  assert.ok(allowed(ROLES).includes(user.role));
  assert.ok(allowed(REGIONS).includes(user.region));
  assert.equal(user.password, DEMO_PASSWORD);
  validDates(user);
  if (user.role === 'shelter') {
    assert.ok(shelters.has(user.shelterId));
    assert.equal(shelters.get(user.shelterId).ownerId, user.id);
  } else assert.equal(user.shelterId, null);
}
for (const shelter of mockShelters) {
  textFields(shelter, ['name', 'address', 'email', 'phone', 'description', 'adoptionPolicy', 'imageUrl', 'imageAlt']);
  assert.equal(users.get(shelter.ownerId)?.role, 'shelter');
  assert.equal(users.get(shelter.ownerId)?.shelterId, shelter.id);
  assert.equal(users.get(shelter.ownerId)?.region, shelter.region);
  assert.ok(allowed(REGIONS).includes(shelter.region));
  assert.ok(shelter.openingHours.length > 0);
  assert.ok(shelter.openingHours.every((hours) => typeof hours === 'string' && hours.trim()));
  assert.ok(Number.isInteger(shelter.establishedYear) && shelter.establishedYear > 1900);
  imageExists(shelter);
}
for (const pet of mockPets) {
  textFields(pet, ['name', 'breed', 'description', 'adoptionNotes', 'healthNotes', 'imageUrl', 'imageAlt']);
  assert.ok(users.has(pet.ownerId), `${pet.id}: missing owner`);
  assert.ok(allowed(SPECIES).includes(pet.species));
  assert.ok(allowed(SIZES).includes(pet.size));
  assert.ok(allowed(REGIONS).includes(pet.region));
  assert.ok(PET_STATUS.includes(pet.status));
  assert.ok(['female', 'male', 'unknown'].includes(pet.sex));
  assert.ok(Number.isInteger(pet.ageMonths) && pet.ageMonths >= 0);
  for (const field of ['isFeatured', 'vaccinated', 'neutered']) assert.equal(typeof pet[field], 'boolean');
  assert.ok(pet.traits.length > 0 && pet.traits.every((trait) => typeof trait === 'string' && trait.trim()));
  assert.ok(Date.parse(pet.createdAt) >= Date.parse(users.get(pet.ownerId).createdAt));
  if (pet.shelterId !== null) {
    const shelter = shelters.get(pet.shelterId);
    assert.ok(shelter, `${pet.id}: missing shelter`);
    assert.equal(pet.ownerId, shelter.ownerId);
    assert.equal(pet.region, shelter.region);
  } else assert.equal(users.get(pet.ownerId).role, 'adopter');
  const requests = mockAdoptionRequests.filter((request) => request.petId === pet.id);
  const approved = requests.filter((request) => request.status === 'approved');
  if (pet.status === 'adopted') {
    assert.equal(approved.length, 1, `${pet.id}: adoption needs exactly one successful request`);
    assert.ok(!requests.some((request) => request.status === 'pending'), `${pet.id}: adopted pet has open requests`);
    assert.ok(Date.parse(pet.updatedAt) >= Date.parse(approved[0].updatedAt));
  } else assert.equal(approved.length, 0, `${pet.id}: approved request without adoption`);
  if (pet.status === 'pending') assert.ok(requests.some((request) => request.status === 'pending'));
  if (pet.isFeatured) assert.equal(pet.status, 'available');
  validDates(pet);
  imageExists(pet);
}
const requestPairs = new Set();
for (const request of mockAdoptionRequests) {
  textFields(request, ['message']);
  const pet = pets.get(request.petId);
  const adopter = users.get(request.adopterId);
  assert.ok(pet, `${request.id}: missing pet`);
  assert.ok(adopter, `${request.id}: missing adopter`);
  assert.notEqual(request.adopterId, pet.ownerId, `${request.id}: self-request`);
  assert.ok(REQUEST_STATUS.includes(request.status));
  const key = `${request.petId}:${request.adopterId}`;
  assert.ok(!requestPairs.has(key), `${request.id}: duplicate adopter/pet pair`);
  requestPairs.add(key);
  validDates(request);
  assert.ok(Date.parse(request.createdAt) >= Date.parse(pet.createdAt));
  assert.ok(Date.parse(request.createdAt) >= Date.parse(adopter.createdAt));
}

 
for (const [options, field] of [[allowed(SPECIES), 'species'], [allowed(SIZES), 'size'], [allowed(REGIONS), 'region'], [PET_STATUS, 'status']]) {
  for (const value of options) assert.ok(mockPets.some((pet) => pet[field] === value), `Missing ${field}: ${value}`);
}
for (const status of REQUEST_STATUS) assert.ok(mockAdoptionRequests.some((request) => request.status === status));
assert.ok(mockPets.some((pet) => pet.ageMonths < 12));
assert.ok(mockPets.some((pet) => pet.ageMonths >= 12 && pet.ageMonths < 84));
assert.ok(mockPets.some((pet) => pet.ageMonths >= 84));
assert.equal(users.get(DEMO_USER_ID)?.email, 'alex@example.com');
assert.equal(getFeaturedPets(mockPets).length, 6);
assert.equal(getPetsByOwner(mockPets, DEMO_USER_ID).length, 3);
assert.equal(getRequestsByAdopter(mockAdoptionRequests, DEMO_USER_ID).length, 4);
assert.equal(getIncomingRequests(mockAdoptionRequests, mockPets, DEMO_USER_ID).length, 6);
assert.equal(getPetsByShelter(mockPets, 'shelter-001').length, 5);
assert.deepEqual(getPetsByShelter(mockPets, null), []);
assert.deepEqual(getPetsByOwner(mockPets, 'user-008'), []);
assert.deepEqual(getRequestsByAdopter(mockAdoptionRequests, 'user-008'), []);
assert.deepEqual(getIncomingRequests(mockAdoptionRequests, mockPets, 'user-008'), []);

 
const first = createMockData();
const second = createMockData();
assert.equal(first.currentUserId, null);
first.pets[0].ownerId = 'user-008';
first.pets[0].traits.push('Changed');
first.users[0].name = 'Changed';
first.adoptionRequests.pop();
first.shelters[0].openingHours.push('Changed');
assert.equal(getPetsByOwner(first.pets, 'user-008').length, 1);
assert.equal(getIncomingRequests(first.adoptionRequests, first.pets, 'user-008').length, 2);
assert.deepEqual(second, createMockData());
assert.equal(mockPets[0].ownerId, DEMO_USER_ID);
assert.ok(!mockPets[0].traits.includes('Changed'));
assert.equal(getPetAgeLabel(0), '0 months');
assert.equal(getPetAgeLabel(1), '1 month');
assert.equal(getPetAgeLabel(12), '1 year');
assert.equal(getPetAgeLabel(25), '2 years 1 month');
assert.equal(getPetAgeLabel(-1), 'Age unknown');
assert.equal(getPetAgeLabel(1.5), 'Age unknown');

console.log(`Validated ${mockUsers.length} users, ${mockShelters.length} shelters, ${mockPets.length} pets, and ${mockAdoptionRequests.length} requests.`);
console.log('Passed: relationships, enums, adoption outcomes, dates, assets, page scenarios, selectors, and independent state copies.');
