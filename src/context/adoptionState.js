import { createMockData, DEMO_USER_ID } from "../data/mockData.js";
import { normalizePetForm, validatePetForm } from "../data/petValidation.js";
 
export const createInitialAdoptionState = (currentUserId = DEMO_USER_ID) => ({
  ...createMockData(),
  currentUserId,
});
export function adoptionReducer(state, action) {
  if (action.type === "SET_USER")
    return action.id === null ||
      state.users.some((user) => user.id === action.id)
      ? { ...state, currentUserId: action.id }
      : state;
  const currentUser = state.users.find(
    (user) => user.id === state.currentUserId,
  );
  if (!currentUser) return state;
  if (action.type === "SAVE_PET") {
    if (Object.keys(validatePetForm(action.values)).length) return state;
    const existing = state.pets.find((pet) => pet.id === action.id);
    if (
      (action.edit && !existing) ||
      (existing && (!action.edit || existing.ownerId !== currentUser.id))
    )
      return state;
    const values = normalizePetForm(action.values);
    const shelter = state.shelters.find(
      (item) => item.id === currentUser.shelterId,
    );
    if (shelter) values.region = shelter.region;
    const pet = existing
      ? { ...existing, ...values, updatedAt: action.now }
      : {
          ...values,
          id: action.id,
          ownerId: currentUser.id,
          shelterId: currentUser.shelterId,
          status: "available",
          isFeatured: false,
          createdAt: action.now,
          updatedAt: action.now,
        };
    return {
      ...state,
      pets: existing
        ? state.pets.map((item) => (item.id === pet.id ? pet : item))
        : [pet, ...state.pets],
    };
  }
  if (action.type === "DELETE_PET") {
    if (
      !state.pets.some(
        (pet) => pet.id === action.id && pet.ownerId === currentUser.id,
      )
    )
      return state;
    return {
      ...state,
      pets: state.pets.filter((pet) => pet.id !== action.id),
      adoptionRequests: state.adoptionRequests.filter(
        (request) => request.petId !== action.id,
      ),
    };
  }
  if (action.type === "REVIEW_REQUEST") {
    const request = state.adoptionRequests.find(
      (item) => item.id === action.id,
    );
    const pet = state.pets.find((item) => item.id === request?.petId);
    if (
      !request ||
      !pet ||
      pet.ownerId !== currentUser.id ||
      request.status !== "pending" ||
      pet.status === "adopted" ||
      !["approved", "rejected"].includes(action.status)
    )
      return state;
    const adoptionRequests = state.adoptionRequests.map((item) => {
      if (item.id === request.id)
        return { ...item, status: action.status, updatedAt: action.now };
      if (
        action.status === "approved" &&
        item.petId === pet.id &&
        item.status === "pending"
      )
        return { ...item, status: "rejected", updatedAt: action.now };
      return item;
    });
    const nextStatus =
      action.status === "approved"
        ? "adopted"
        : pet.status === "pending" &&
            !adoptionRequests.some(
              (item) => item.petId === pet.id && item.status === "pending",
            )
          ? "available"
          : pet.status;
    return {
      ...state,
      adoptionRequests,
      pets: state.pets.map((item) =>
        item.id === pet.id
          ? {
              ...item,
              status: nextStatus,
              isFeatured: nextStatus === "adopted" ? false : item.isFeatured,
              updatedAt: action.now,
            }
          : item,
      ),
    };
  }
  return state;
}
