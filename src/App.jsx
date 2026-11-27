
import { Route,Routes, useLocation } from "react-router"
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
import Footer from "./components/Footer"





function App() {
  const { pathname } = useLocation();
  const workspace = /^\/dashboard\/?$/.test(pathname) || /^\/pets\/new\/?$/.test(pathname) || /^\/pets\/[^/]+\/edit\/?$/.test(pathname);
  return (
    <>
    <Navbar />
        

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pets" element={<PetListPage />} />
      <Route path="/pets/:id" element={<PetDetailsPage />} />
      <Route path="/pets/new" element={<PetFormPage />} />
      <Route path="/pets/:id/edit" element={<PetFormPage />} />
      <Route path="/shelters" element={<ShelterListPage />} />
      <Route path="/shelters/:id" element={<ShelterDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    {!workspace && <Footer />}
</>
  )
}

export default App
