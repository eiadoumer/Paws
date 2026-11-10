import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adoptionReducer, createInitialAdoptionState } from '../src/context/adoptionState.js';
import { emptyPetForm, isSafeImageUrl, validatePetForm, validatePhotoFile, MAX_PHOTO_BYTES } from '../src/data/petValidation.js';
const now = '2026-11-09T15:00:00Z';
const values = { ...emptyPetForm, name: 'Poppy', ageMonths: '15', description: 'Poppy is a gentle companion who loves walks and quiet evenings.' };
const save = (state, overrides = {}) => adoptionReducer(state, { type: 'SAVE_PET', values, id: 'pet-test', now, ...overrides });

test('add pet joins the individual lister and leaves seed data unchanged', () => {
  const state = createInitialAdoptionState(); const next = save(state);
  const pet = next.pets.find((item) => item.id === 'pet-test');
  assert.equal(pet.ownerId, 'user-001'); assert.equal(pet.shelterId, null);
  assert.equal(pet.ageMonths, 15); assert.equal(pet.status, 'available');
  assert.equal(next.pets.length, state.pets.length + 1);
  assert.equal(state.pets.some((item) => item.id === pet.id), false);
});
test('shelter add uses its linked shelter and canonical region', () => {
  const next = save(createInitialAdoptionState('user-004'), { values: { ...values, region: 'east' } });
  assert.equal(next.pets[0].ownerId, 'user-004'); assert.equal(next.pets[0].shelterId, 'shelter-001'); assert.equal(next.pets[0].region, 'central');
});
test('edit preserves listing identity, history, ownership and adopted status', () => {
  const state = createInitialAdoptionState();
  const original = state.pets.find((item) => item.id === 'pet-002');
  const next = save(state, { id: original.id, edit: true, values: { ...original, name: 'Luna Rose', ownerId: 'user-999', status: 'available' } });
  const edited = next.pets.find((item) => item.id === original.id);
  assert.equal(edited.name, 'Luna Rose'); assert.equal(edited.ownerId, original.ownerId);
  assert.equal(edited.createdAt, original.createdAt); assert.equal(edited.status, 'adopted');
});
test('reject foreign edits, foreign deletes, invalid IDs, invalid forms and guest mutations', () => {
  const state = createInitialAdoptionState();
  assert.equal(save(state, { id: 'pet-004', edit: true }), state);
  assert.equal(save(state, { id: 'pet-missing', edit: true }), state);
  assert.equal(save(state, { values: { ...values, ageMonths: '-1' } }), state);
  assert.equal(adoptionReducer(state, { type: 'DELETE_PET', id: 'pet-004' }), state);
  assert.equal(adoptionReducer(state, { type: 'SET_USER', id: 'missing' }), state);
  const guest = createInitialAdoptionState(null); assert.equal(save(guest), guest);
});
test('approval completes one adoption, rejects competitors, and cannot approve again', () => {
  const state = createInitialAdoptionState();
  const next = adoptionReducer(state, { type: 'REVIEW_REQUEST', id: 'request-001', status: 'approved', now });
  assert.equal(next.pets.find((pet) => pet.id === 'pet-001').status, 'adopted');
  assert.equal(next.pets.find((pet) => pet.id === 'pet-001').isFeatured, false);
  assert.equal(next.adoptionRequests.find((request) => request.id === 'request-002').status, 'rejected');
  assert.equal(adoptionReducer(next, { type: 'REVIEW_REQUEST', id: 'request-002', status: 'approved', now }), next);
  const other = createInitialAdoptionState('user-003');
  assert.equal(adoptionReducer(other, { type: 'REVIEW_REQUEST', id: 'request-001', status: 'approved', now }), other);
});
test('declining the last pending candidate reopens a reserved listing', () => {
  const next = adoptionReducer(createInitialAdoptionState(), { type: 'REVIEW_REQUEST', id: 'request-005', status: 'rejected', now });
  assert.equal(next.pets.find((pet) => pet.id === 'pet-003').status, 'available');
});
test('deleting own listing cascades requests without orphaning references', () => {
  const next = adoptionReducer(createInitialAdoptionState(), { type: 'DELETE_PET', id: 'pet-001' });
  assert.ok(!next.pets.some((pet) => pet.id === 'pet-001'));
  assert.ok(!next.adoptionRequests.some((request) => request.petId === 'pet-001'));
  assert.ok(next.adoptionRequests.every((request) => next.pets.some((pet) => pet.id === request.petId)));
});
test('validation accepts zero-month age and rejects unsafe URLs and invalid enum values', () => {
  assert.deepEqual(validatePetForm({ ...values, ageMonths: '0' }), {});
  for (const ageMonths of ['', '-1', '1.5', '601', 'Infinity']) assert.ok(validatePetForm({ ...values, ageMonths }).ageMonths);
  assert.ok(validatePetForm({ ...values, species: 'Dog' }).species);
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.test/pet.svg', '/images/../secret']) assert.equal(isSafeImageUrl(url), false);
  assert.equal(isSafeImageUrl('https://example.com/pet.jpg'), true);
  assert.equal(isSafeImageUrl('/images/mock/dog.svg'), true);
});

const uploadedPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ZkAAAAASUVORK5CYII=';
test('uploaded photo stays on a shared listing through add and edit', () => {
  const added = save(createInitialAdoptionState(), { values: { ...values, imageUrl: uploadedPhoto } });
  assert.equal(added.pets.find(pet => pet.id === 'pet-test').imageUrl, uploadedPhoto);
  const edited = save(added, { id: 'pet-test', edit: true, values: { ...values, name: 'Poppy Rose', imageUrl: uploadedPhoto } });
  assert.equal(edited.pets.find(pet => pet.id === 'pet-test').imageUrl, uploadedPhoto);
  const removed = save(edited, { id: 'pet-test', edit: true, values: { ...values, imageUrl: '' } });
  assert.equal(removed.pets.find(pet => pet.id === 'pet-test').imageUrl, '/images/mock/dog-friendly.webp');
});
test('photo validation enforces file types and size and rejects non-raster data URLs', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(validatePhotoFile({type, size: MAX_PHOTO_BYTES}), '');
  assert.ok(validatePhotoFile({type:'image/svg+xml',size:100}));
  assert.ok(validatePhotoFile({type:'image/png',size:0}));
  assert.ok(validatePhotoFile({type:'image/png',size:MAX_PHOTO_BYTES+1}));
  assert.ok(isSafeImageUrl(uploadedPhoto));
  assert.equal(isSafeImageUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), false);
  assert.equal(isSafeImageUrl('data:image/png;base64,invalid!'), false);
});
