import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";   // ✅ FIXED
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppinment from "./pages/MyAppinment";
import Appinment from "./pages/Appinment";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:specilaty" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppinment />} />
        <Route path="/appointments/:docId" element={<Appinment />} />
      </Routes>
    </>
  );
}

export default App;
