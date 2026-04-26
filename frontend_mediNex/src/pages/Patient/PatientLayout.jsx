import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, CalendarDays, Archive, 
  LogOut, User, Menu, X, Bell, 
  ShieldCheck, HeartPulse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import axios from "axios";

const PatientLayout = () => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const backendUrl = "http://localhost:4000";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/patient/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    if (token) fetchMessages();

    // Socket connection for real-time broadcast updates
    const socket = io(backendUrl);
    if (user?.id) {
      socket.emit("joinPatientRoom", user.id);
    }

    socket.on("new_broadcast_message", () => {
      // Re-fetch to get populated fields
      fetchMessages();
      // Play 5-second alert sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.1);
        // Pulsing beep pattern for urgency
        for (let i = 0; i < 10; i++) {
          gain.gain.setValueAtTime(0.5, ctx.currentTime + i * 0.5);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.5 + 0.25);
        }
        osc.start();
        osc.stop(ctx.currentTime + 5);
      } catch (e) { console.error("Audio error:", e); }
    });

    return () => socket.disconnect();
  }, [token, user?.id]);

  const clearMessage = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/patient/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (error) {
      console.error("Failed to clear message:", error);
    }
  };

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
            <div className="relative">
              <button 
                onClick={() => setIsInboxOpen(!isInboxOpen)}
                className="relative w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:shadow-lg transition-all group"
              >
                 <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                 {messages.length > 0 && (
                   <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                 )}
              </button>

              <AnimatePresence>
                {isInboxOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsInboxOpen(false)}
                    ></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-16 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                          <Bell size={18} /> Notifications
                        </h3>
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">{messages.length} New</span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3 bg-slate-50/50">
                        {messages.length === 0 ? (
                          <div className="text-center py-10 text-slate-400">
                            <Bell size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No new messages from clinics.</p>
                          </div>
                        ) : (
                          messages.map(msg => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={msg._id} 
                              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3 relative group hover:shadow-md transition-shadow"
                            >
                              <div className="flex gap-3 mb-3 pr-6">
                                <img src={msg.doctorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.doctorId?.name || 'Doctor')}`} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{msg.doctorId?.name}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{msg.brokerId?.clinic_name}</p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 font-medium">
                                {msg.message}
                              </p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); clearMessage(msg._id); }}
                                className="absolute top-3 right-3 text-slate-300 hover:text-red-500 bg-white hover:bg-red-50 p-1.5 rounded-full transition-colors"
                              >
                                <X size={14} className="pointer-events-none" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          
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
