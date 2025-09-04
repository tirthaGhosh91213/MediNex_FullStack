import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Info,
  Phone,
  ChevronDown,
  User,
  Calendar,
  LogOut,
  Menu,
  X,
} from "lucide-react"; // icons

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-white shadow-md relative">
      {/* Logo */}
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-blue-500 cursor-pointer"
      >
        Medi/Nex
      </h1>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Home size={18} /> Home
        </NavLink>
        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Users size={18} /> All Doctors
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Info size={18} /> About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Phone size={18} />  Contact
        </NavLink>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {token ? (
          <div className="relative" ref={profileRef}>
            {/* Profile Circle (Click to toggle) */}
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1 cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                T
              </div>
              <ChevronDown size={16} className="text-gray-600" />
            </div>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50">
                <div className="flex flex-col p-2 text-gray-700">
                  <button
                    onClick={() => {
                      navigate("/my-profile");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md transition"
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/my-appointments");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition"
                  >
                    <Calendar size={10} /> My Appointments
                  </button>
                  <button
                    onClick={() => {
                      setToken(false);
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-red-500 transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition"
          >
            Create Account
          </button>
        )}

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden flex flex-col p-4 space-y-3 z-50">
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100"
          >
            <Home size={18} /> Home
          </NavLink>
          <NavLink
            to="/doctors"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100"
          >
            <Users size={18} /> All Doctors
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100"
          >
            <Info size={18} /> About
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100"
          >
            <Phone size={18} /> Contact
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default Navbar;
