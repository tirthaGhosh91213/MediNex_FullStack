import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, CalendarDays, Archive, LogOut, User, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PatientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/patient/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Bookings", path: "/patient/my-bookings", icon: <CalendarDays size={20} /> },
    { name: "Health Vault", path: "/patient/vault", icon: <Archive size={20} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-serif">M</div>
           <span className="text-xl font-bold text-blue-600 tracking-tight">MediConnect</span>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
           <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all relative overflow-hidden group ${
                isActive ? "text-blue-700 bg-blue-50" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              {isActive && <motion.div layoutId="patientTab" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />}
              <span className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500 transition-colors"}>
                 {link.icon}
              </span>
              {link.name}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 min-h-0 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex-col shadow-sm hidden md:flex shrink-0">
         <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
             <motion.div
               initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-4/5 max-w-sm h-full bg-white flex flex-col shadow-2xl"
               onClick={e => e.stopPropagation()}
             >
                <SidebarContent />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-500 hover:text-blue-600 transition" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              {navLinks.find(i => i.path === location.pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
          
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-50 pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-inner overflow-hidden">
                 {user?.avatar ? <img src={user.avatar} className="object-cover w-full h-full" alt="profile"/> : <User size={16} />}
              </div>
              <span className="font-bold text-sm text-slate-700 hidden sm:block truncate max-w-[120px]">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 relative">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
