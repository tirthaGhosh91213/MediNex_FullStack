import React, { useState } from "react";
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
} from "lucide-react"; // icons

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(true);

  return (
    <div className="flex items-center justify-between px-6 py-4  border-b border-gray-300 bg-white shadow-md">
      {/* Logo */}
      <h1
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-blue-500 cursor-pointer"
      >
       Medi/Nex
      </h1>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Home size={18} /> Home
        </NavLink>
        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Users size={18} /> All Doctors
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Info size={18} /> About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition ${
              isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-500"
            }`
          }
        >
          <Phone size={18} /> Contact
        </NavLink>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {token ? (
          <div className="relative group cursor-pointer">
            {/* Profile Circle */}
            <div className="flex items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                T
              </div>
              <ChevronDown size={16} className="text-gray-600" />
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 origin-top-right z-50">
              <div className="flex flex-col p-2 text-gray-700">
                <button
                  onClick={() => navigate("/my-profile")}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md transition"
                >
                  <User size={16} /> My Profile
                </button>
                <button
                  onClick={() => navigate("/my-appointments")}
                  className="flex items-center text-sm gap-2 px-4 py-2 hover:bg-gray-100 rounded-md transition"
                >
                  <Calendar size={16} /> My Appointments
                </button>
                <button
                  onClick={() => setToken(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-red-500 transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition"
          >
            Create Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
