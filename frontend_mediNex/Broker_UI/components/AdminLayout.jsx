import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Calendar, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/doc-chambers', label: 'Analytics', icon: LayoutDashboard, exact: true },
    { path: '/doc-chambers/alldoctors', label: 'All Doctors', icon: Users },
    { path: '/doc-chambers/all-appointments', label: 'All Appointments', icon: Calendar },
    { path: '/doc-chambers/add-doctors', label: 'Add Doctor', icon: UserPlus },
    { path: '/doc-chambers/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0 z-20">
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Medi<span className="text-slate-800">Admin</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            // Logic to check if exact path matches (for the root /doc-chambers)
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        <header className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-extrabold text-blue-600">Medi<span className="text-slate-800">Admin</span></h1>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {/* AnimatePresence allows for smooth page transitions based on the route key */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;