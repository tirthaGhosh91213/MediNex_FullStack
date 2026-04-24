import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, CalendarDays, Archive, 
  LogOut, User, Menu, X, Bell, 
  Search, ShieldCheck, HeartPulse 
} from "lucide-react";
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
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-900/50">
              <HeartPulse size={24} />
           </div>
           <div>
             <span className="text-xl font-black text-white tracking-tight block leading-none">MediNex</span>
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1 block">Patient Portal</span>
           </div>
        </div>
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
           <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 py-8 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2">Main Menu</p>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative overflow-hidden group ${
                isActive 
                ? "text-white bg-blue-600 shadow-xl shadow-blue-600/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400 transition-colors"}`}>
                 {link.icon}
              </span>
              <span className="text-sm tracking-wide">{link.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeGlow" 
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" 
                />
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-8 mt-auto">
        <div className="bg-white/5 rounded-3xl p-5 mb-6 border border-white/5">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest">Premium Care</span>
           </div>
           <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
             You are receiving the highest priority healthcare services.
           </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-sm text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/20 transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] min-h-0 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="w-80 bg-[#0F172A] hidden md:flex shrink-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)] z-20">
         <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
             <motion.div
               initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="w-[85%] max-w-sm h-full flex flex-col shadow-2xl"
               onClick={e => e.stopPropagation()}
             >
                <SidebarContent />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-24 flex items-center justify-between px-8 sm:px-12 z-10 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              className="md:hidden w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all border border-slate-100" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
               <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {navLinks.find(i => i.path === location.pathname)?.name || "Patient Portal"}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all group">
               <Bell size={20} className="group-hover:rotate-12 transition-transform" />
               <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
            </button>
          
            {/* User Profile Pill */}
            <div className="flex items-center gap-4 bg-white p-1.5 pr-6 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 overflow-hidden shrink-0">
                 {user?.avatar ? <img src={user.avatar} className="object-cover w-full h-full" alt="profile"/> : <User size={20} />}
              </div>
              <div className="hidden sm:block">
                <span className="block font-black text-sm text-slate-800 leading-none">{user?.name}</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 block">Patient Account</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 sm:p-12 lg:p-16 custom-scrollbar relative z-0">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
