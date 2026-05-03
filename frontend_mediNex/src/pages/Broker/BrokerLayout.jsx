import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

import { motion } from "framer-motion";
import { 
  Building2, LayoutDashboard, Users, CalendarCheck, 
  ActivitySquare, LogOut, Bell, AlertTriangle, Trash2, X, TrendingUp, Video
} from "lucide-react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import EmergencyAlertModal from "../../components/EmergencyAlertModal";

const socket = io("http://localhost:4000");

const BrokerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: "/broker/dashboard", name: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/broker/doctors", name: "Manage Doctors", icon: <Users size={20} /> },
    { path: "/broker/appointments", name: "Appointments", icon: <CalendarCheck size={20} /> },
    { path: "/broker/online-sessions", name: "Online Sessions", icon: <Video size={20} /> },
    { path: "/broker/performance", name: "Clinic Performance", icon: <TrendingUp size={20} /> },
  ];

  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
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

    // ── Emergency Booking Alert (30-second ring) ─────────────────
    const handleNewBooking = (data) => {
      console.log("🚨 Emergency Booking Received:", data);
      // Show the fullscreen emergency alert with 30s alarm
      setEmergencyAlert(data);
      // Also add to notifications list
      setNotifications(prev => [{
        message: data.message || "🚨 Emergency booking received!",
        createdAt: new Date().toISOString(),
      }, ...prev]);
    };

    socket.on("doctorApproved", handleDoctorApproved);
    socket.on("newBooking", handleNewBooking);
    
    return () => {
      socket.off("doctorApproved", handleDoctorApproved);
      socket.off("newBooking", handleNewBooking);
    };
  }, [user?._id]);


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Emergency Alert Modal (30-second ring) ───────────────── */}
      <AnimatePresence>
        {emergencyAlert && (
          <EmergencyAlertModal
            booking={emergencyAlert}
            onDismiss={() => setEmergencyAlert(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col hidden md:flex z-10 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Clinic Portal</h1>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em]">MediConnect Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all group overflow-hidden ${
                  isActive 
                  ? "text-white bg-blue-600 shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400 transition-colors"}`}>
                  {item.icon}
                </span>
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active" 
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" 
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
             <p className="font-bold text-white line-clamp-1">{user?.clinic_name || "MediClinic"}</p>
             <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-black text-sm text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/20 transition-all group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout
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
