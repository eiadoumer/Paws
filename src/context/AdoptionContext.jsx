import { useAppData } from "./AppDataContext.jsx";
import { adoptionReducer } from "./adoptionState.js";

export function useAdoption() {
  const context = useAppData();
  if (!context) throw new Error("Wrap the application in AppDataProvider.");
  const { data, setData } = context;
  const currentUser = data.users.find((user) => user.id === data.currentUserId) || null;
  const dispatch = (action) => setData((previous) => adoptionReducer(previous, action));
  return {
    data,
    currentUser,
    dispatch,
    setCurrentUser: (id) => dispatch({ type: "SET_USER", id }),
    savePet: (values, existingId) => {
      const id = existingId || `pet-${crypto.randomUUID()}`;
      dispatch({ type: "SAVE_PET", id, values, edit: Boolean(existingId), now: new Date().toISOString() });
      return id;
    },
    deletePet: (id) => dispatch({ type: "DELETE_PET", id }),
    reviewRequest: (id, status) => dispatch({ type: "REVIEW_REQUEST", id, status, now: new Date().toISOString() }),
  };
}
