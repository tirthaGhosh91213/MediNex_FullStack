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
import DashboardHome from "../Broker_UI/components/DashboardHome";
import AllDoctors from "../Broker_UI/components/AllDoctors";
import AddDoctor from "../Broker_UI/components/AddDoctor";
import AllAppointments from "../Broker_UI/components/AllAppointments";
import AdminProfile from "../Broker_UI/components/AdminProfile";
import AdminLayout from "../Broker_UI/components/AdminLayout";
import DoctorRequestApproval from "../Broker_UI/components/DoctorRequestApproval";
function App() {
  const location = useLocation();

  const hideNavbar = location.pathname.startsWith("/appointments");

  return (
    <>
      {!hideNavbar && <Navbar />}

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
        <Route path="/doc-chambers" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} /> 
          <Route path="alldoctors" element={<AllDoctors />} />
          <Route path="add-doctors" element={<AddDoctor />} />
          <Route path="all-appointments" element={<AllAppointments />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="doctor-requests" element={<DoctorRequestApproval />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}

export default App;
