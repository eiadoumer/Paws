import { createContext, useContext, useReducer } from "react";
import {
  adoptionReducer,
  createInitialAdoptionState,
} from "./adoptionState.js";
const AdoptionContext = createContext(null);
export function AdoptionProvider({ children, initialState }) {
  const [data, dispatch] = useReducer(
    adoptionReducer,
    initialState,
    (state) => state || createInitialAdoptionState(),
  );
  const currentUser =
    data.users.find((user) => user.id === data.currentUserId) || null;
  const value = {
    data,
    currentUser,
    dispatch,
    setCurrentUser: (id) => dispatch({ type: "SET_USER", id }),
    savePet: (values, existingId) => {
      const id = existingId || `pet-${crypto.randomUUID()}`;
      dispatch({
        type: "SAVE_PET",
        id,
        values,
        edit: Boolean(existingId),
        now: new Date().toISOString(),
      });
      return id;
    },
    deletePet: (id) => dispatch({ type: "DELETE_PET", id }),
    reviewRequest: (id, status) =>
      dispatch({
        type: "REVIEW_REQUEST",
        id,
        status,
        now: new Date().toISOString(),
      }),
  };
  return (
    <AdoptionContext.Provider value={value}>
      {children}
    </AdoptionContext.Provider>
  );
}
export function useAdoption() {
  const context = useContext(AdoptionContext);
  if (!context)
    throw new Error(
      "Wrap your routes in AdoptionProvider before using useAdoption.",
    );
  return context;
}
