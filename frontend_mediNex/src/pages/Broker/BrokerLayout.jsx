import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

import { motion } from "framer-motion";
import { 
  Building2, LayoutDashboard, Users, CalendarCheck, 
  ActivitySquare, LogOut, Bell, AlertTriangle, Trash2, X, TrendingUp
} from "lucide-react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

const socket = io("http://localhost:4000");

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: "/broker/dashboard", name: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/broker/doctors", name: "Manage Doctors", icon: <Users size={20} /> },
    { path: "/broker/appointments", name: "Appointments", icon: <CalendarCheck size={20} /> },
    { path: "/broker/performance", name: "Clinic Performance", icon: <TrendingUp size={20} /> },
  ];

  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const backendUrl = "http://localhost:4000";

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${backendUrl}/api/broker/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`${backendUrl}/api/broker/notifications/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setNotifications([]);
        toast.success("Notifications cleared");
      }
    } catch (error) {
      console.error("Clear Notifications Error:", error);
      toast.error("Failed to clear notifications");
    }
  };

  // Audio beep (5 seconds) for broker notifications
  const playNotificationSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.1);
    osc.start();
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
    osc.stop(ctx.currentTime + 5.1);
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("joinBrokerRoom", user._id);
      console.log("Joined Broker Room:", user._id);
      fetchNotifications();
    }
    
    const handleDoctorApproved = (data) => {
      toast.success(data.message, { duration: 8000, icon: "🎉" });
      playNotificationSound();
      setNotifications(prev => [data, ...prev]);
    };

    socket.on("doctorApproved", handleDoctorApproved);
    
    return () => {
      socket.off("doctorApproved", handleDoctorApproved);
    };
  }, [user?._id]);


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
          
          <div className="flex items-center gap-4 relative">
             <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
             >
               <Bell size={20} />
               {notifications.length > 0 && (
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               )}
             </button>

             {/* Notifications Dropdown */}
             <AnimatePresence>
               {showNotifications && (
                 <>
                   <div 
                     className="fixed inset-0 z-20" 
                     onClick={() => setShowNotifications(false)}
                   />
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30 overflow-hidden"
                   >
                     <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         Notifications
                         <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                           {notifications.length}
                         </span>
                       </h3>
                       {notifications.length > 0 && (
                         <button 
                           onClick={clearNotifications}
                           className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                         >
                           <Trash2 size={12} /> Clear All
                         </button>
                       )}
                     </div>
                     <div className="max-h-[400px] overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-10 text-center">
                           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                             <Bell size={24} />
                           </div>
                           <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
                         </div>
                       ) : (
                         notifications.map((notif, index) => (
                           <div 
                             key={notif._id || index}
                             className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-default group"
                           >
                             <div className="flex gap-3">
                               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                 <ActivitySquare size={16} />
                               </div>
                               <div className="flex-1">
                                 <p className="text-sm text-slate-700 leading-snug font-medium">{notif.message}</p>
                                 <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">
                                   {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                               </div>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50">
          {user?.is_approved === false && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Account Pending Verification</h3>
                <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                  The admin is currently verifying your account. Please allow up to <strong>24 working hours</strong> for approval. During this time, you can add doctors to your roster, but they will not be visible to patients until your clinic is approved.
                </p>
              </div>
            </div>
          )}
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrokerLayout;
