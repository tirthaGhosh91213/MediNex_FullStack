import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Doctors from "./pages/Doctors";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Patient Imports
import PatientLayout from "./pages/Patient/PatientLayout";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import MyBookings from "./pages/Patient/MyBookings";
import HealthVault from "./pages/Patient/HealthVault";

// Broker Imports
import BrokerLayout from "./pages/Broker/BrokerLayout";
import BrokerOverview from "./pages/Broker/Dashboard/BrokerOverview";
import ManageDoctors from "./pages/Broker/Doctors/ManageDoctors";
import BookingRequests from "./pages/Broker/Bookings/BookingRequests";
import LiveQueue from "./pages/Broker/Queue/LiveQueue";

// Admin Imports
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminOverview from "./pages/Admin/AdminOverview";
import ApprovalQueue from "./pages/Admin/ApprovalQueue";
import AdminMasterManagement from "./pages/Admin/AdminMasterManagement";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/appointments") || 
                     location.pathname.startsWith("/login") || 
                     location.pathname.startsWith("/register") ||
                     location.pathname.startsWith("/admin") ||
                     location.pathname.startsWith("/broker") ||
                     location.pathname.startsWith("/patient");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:specialty" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected Patient Routes */}
        <Route element={<ProtectedRoute allowedRole="Patient" />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="vault" element={<HealthVault />} />
          </Route>
        </Route>

        {/* Protected Broker Routes */}
        <Route element={<ProtectedRoute allowedRole="Broker" />}>
          <Route path="/broker" element={<BrokerLayout />}>
            <Route path="dashboard" element={<BrokerOverview />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="appointments" element={<BookingRequests />} />
            <Route path="queue" element={<LiveQueue />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="Admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="approvals" element={<ApprovalQueue />} />
            <Route path="master" element={<AdminMasterManagement />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="p-10 text-center text-xl text-red-600 font-bold">404 - Page Not Found</div>} />
      </Routes>

      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;
