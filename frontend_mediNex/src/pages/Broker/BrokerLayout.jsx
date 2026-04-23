import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Building2, LayoutDashboard, Users, CalendarCheck, 
  ActivitySquare, LogOut, Bell
} from "lucide-react";
import { motion } from "framer-motion";

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: "/broker/dashboard", name: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/broker/doctors", name: "Manage Doctors", icon: <Users size={20} /> },
    { path: "/broker/appointments", name: "Appointments", icon: <CalendarCheck size={20} /> },
    { path: "/broker/queue", name: "Live Queue", icon: <ActivitySquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Clinic Portal</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">MediConnect Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group overflow-hidden ${
                  isActive ? "text-blue-700 bg-blue-50/80" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                )}
                <span className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500 transition-colors"}>
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
             <p className="font-bold text-slate-800 line-clamp-1">{user?.clinic_name || "MediClinic"}</p>
             <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
             {menuItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
          </h2>
          
          <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BrokerLayout;
