import { createContext, useContext, useState } from "react";
import { createMockData } from "../data/mockData.js";

const AppDataContext = createContext(null);

// Holds the one shared copy of the app's data. Wrap this around all routes once,
// so every page reads and updates the same users, pets, shelters and requests.
export function AppDataProvider({ children }) {
  const [data, setData] = useState(createMockData);

  return <AppDataContext.Provider value={{ data, setData }}>{children}</AppDataContext.Provider>;
}

// Use inside any page: const { data, setData } = useAppData();
export function useAppData() {
  return useContext(AppDataContext);
}
