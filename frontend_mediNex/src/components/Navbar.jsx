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
  LayoutDashboard // <-- Added for the Doc Chambers icon
} from "lucide-react"; 

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
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm relative z-50">
      {/* Logo */}
      <h1
        onClick={() => window.location.reload()}
        className="text-2xl font-extrabold text-blue-600 cursor-pointer tracking-tight"
      >
        Medi<span className="text-slate-800">Nex</span>
      </h1>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-2 font-medium">
        {[
          { path: "/", label: "Home", icon: Home },
          { path: "/doctors", label: "All Doctors", icon: Users },
          { path: "/about", label: "About", icon: Info },
          { path: "/contact", label: "Contact", icon: Phone }
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`
            }
          >
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {token ? (
          <div className="relative" ref={profileRef}>
            {/* Profile Circle (Click to toggle) */}
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm">
                T
              </div>
              <ChevronDown size={16} className={`text-slate-600 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 shadow-xl rounded-xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
                <div className="flex flex-col p-1.5 text-slate-700">
                  <button
                    onClick={() => {
                      navigate("/my-profile");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <User size={16} className="text-slate-400" /> My Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate("/my-appointments");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Calendar size={16} className="text-slate-400" /> My Appointments
                  </button>

                  {/* NEW: Doc Chambers Option */}
                  <button
                    onClick={() => {
                      navigate("/doc-chambers"); // This will route to your DashboardView
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard size={16} className="text-blue-500" /> Doc Chambers
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setToken(false);
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors text-sm font-medium"
                  >
                    <LogOut size={16} className="text-rose-500" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
          >
            Create Account
          </button>
        )}

        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg md:hidden flex flex-col p-4 space-y-1 z-50">
          {[
            { path: "/", label: "Home", icon: Home },
            { path: "/doctors", label: "All Doctors", icon: Users },
            { path: "/about", label: "About", icon: Info },
            { path: "/contact", label: "Contact", icon: Phone }
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;