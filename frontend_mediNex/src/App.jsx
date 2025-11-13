import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppinment from "./pages/MyAppinment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Appoinments from "./pages/Appoinments";

function App() {
  const location = useLocation();
  
  const showNavbar = location.pathname !== "/appointments";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:specilaty" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppinment />} />
        <Route path="/appointments/:docId" element={<Appoinments />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
