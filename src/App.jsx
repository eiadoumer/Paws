
import { Route,Routes } from "react-router"
import HomePage from "./pages/HomePage"
import PetListPage from "./pages/PetListPage"
import PetDetailsPage from "./pages/PetDetailsPage"
import NotFoundPage from "./pages/NotFoundPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import PetFormPage from "./pages/PetFormPage"
import ShelterDetailsPage from "./pages/ShelterDetailsPage"
import ShelterListPage from "./pages/ShelterListPage"
import DashboardPage from "./pages/DashboardPage"

import Navbar from "./components/Navbar"





function App() {
  return (
    <>
    <Navbar />
        

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pets" element={<PetListPage />} />
      <Route path="/pets/:id" element={<PetDetailsPage />} />
      <Route path="/pets/new" element={<PetFormPage />} />
      <Route path="/shelters" element={<ShelterListPage />} />
      <Route path="/shelters/:id" element={<ShelterDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
</>
  )
}

export default App
