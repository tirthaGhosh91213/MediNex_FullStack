import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Menu, X, LineChart, ShieldCheck, Database, 
  LogOut, Bell, Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/admin/dashboard", name: "Overview Analytics", icon: <LineChart size={20} /> },
    { path: "/admin/approvals", name: "Approval Queues", icon: <ShieldCheck size={20} /> },
    { path: "/admin/master", name: "Master Database", icon: <Database size={20} /> },
  ];

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-indigo-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-700 shadow-lg">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Master Control</h1>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Super Admin</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button className="md:hidden text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>
           <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-white text-indigo-700 shadow-md" 
                  : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-700/50 shrink-0">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-700 hover:bg-red-500 transition-colors shadow-sm"
        >
          <LogOut size={16} /> Secure Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-indigo-800 to-indigo-950 flex-col hidden md:flex z-20 shadow-xl">
         <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm h-full bg-gradient-to-b from-indigo-800 to-indigo-950 flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
               <NavContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
             <button 
               className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
               onClick={() => setIsMobileMenuOpen(true)}
             >
               <Menu size={24} />
             </button>
             <h2 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">
               {navLinks.find(i => i.path === location.pathname)?.name || "Dashboard"}
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
               <Bell size={20} />
               {/* Socket.io Notification Ping */}
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Scrollable Content with transition wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
