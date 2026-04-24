import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import axios from "axios";

const socket = io("http://localhost:4000");
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
  const [hasNotification, setHasNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = React.useRef(null);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Play 5 gentle beeps over 5 seconds
      for (let i = 0; i < 5; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + i); 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + i);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + i + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + i + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(audioCtx.currentTime + i);
        oscillator.stop(audioCtx.currentTime + i + 0.5);
      }
    } catch (e) {
      console.error("Audio API not supported", e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    fetchNotifications();

    socket.on("newAdminNotification", (data) => {
      setHasNotification(true);
      setNotifications((prev) => [data, ...prev]);
      playNotificationSound();
      toast.success(data.message, {
         duration: 6000,
         icon: data.type === 'NEW_CLINIC' ? '🏥' : '👨‍⚕️',
      });
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("newAdminNotification");
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/admin/notifications");
      if (data.success) {
        setNotifications(data.notifications);
        if (data.notifications.length > 0) setHasNotification(true);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.delete("/admin/notifications/clear");
      setNotifications([]);
      setHasNotification(false);
      setIsNotifOpen(false);
      toast.success("Notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

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
        <header className="relative h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-50 shrink-0">
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
          
          <div className="flex items-center gap-4 relative" ref={notifRef}>
             <button 
                onClick={() => {
                  setHasNotification(false);
                  setIsNotifOpen(!isNotifOpen);
                }}
                className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
             >
               <Bell size={20} />
               {/* Socket.io Notification Ping */}
               {hasNotification && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
               )}
             </button>

             {/* Notifications Dropdown */}
             <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center z-50">
                       <h3 className="font-bold text-slate-800">Notifications</h3>
                       {notifications.length > 0 && (
                         <button onClick={clearNotifications} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                           Clear All
                         </button>
                       )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                       ) : (
                         <div className="divide-y divide-slate-50">
                           {notifications.map((notif, idx) => (
                             <div key={idx} className={`p-4 flex gap-3 items-start transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}>
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'NEW_CLINIC' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                 {notif.type === 'NEW_CLINIC' ? '🏥' : '👨‍⚕️'}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-sm text-slate-700 font-medium leading-snug">{notif.message}</p>
                                 <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
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
