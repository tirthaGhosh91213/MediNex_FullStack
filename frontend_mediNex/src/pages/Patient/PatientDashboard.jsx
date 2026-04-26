import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Loader2, Sparkles, UserSearch, MapPin, Activity, CalendarDays, Clock, Users } from "lucide-react";
import DoctorCard from "./DoctorCard";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

const socket = io("http://localhost:4000");

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Live Queue State
  const [activeBookings, setActiveBookings] = useState([]);
  const [liveQueues, setLiveQueues] = useState({}); // Keyed by doctorId

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const specializations = [
    "Cardiologist", "Dermatologist", "Neurologist", 
    "Pediatrician", "Orthopedic", "General Physician"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchTodayBookings();

    socket.on("queueUpdated", (updateData) => {
      setLiveQueues(prev => ({
        ...prev,
        [updateData.doctorId]: {
          ...(prev[updateData.doctorId] || {}),
          nowServing: updateData.nowServing ? { token: updateData.nowServing } : null
        }
      }));
    });

    socket.on("yourTurn", (data) => {
      toast.success(data.message, { duration: 6000, icon: "🩺" });
    });

    return () => {
      socket.off("queueUpdated");
      socket.off("yourTurn");
    };
  }, [searchTerm, specialtyFilter]);

  const fetchTodayBookings = async () => {
    try {
      const { data } = await axios.get("/patient/my-bookings");
      if (data.success) {
        // Find all bookings that are for today and active (using local timezone)
        const todayStr = new Date().toLocaleDateString();
        const activeForToday = data.bookings.filter(b => {
          const bookingDateStr = new Date(b.date).toLocaleDateString();
          const isToday = bookingDateStr === todayStr;
          const isActive = b.status === "Pending" || b.status === "Accepted" || b.status === "In-Progress";
          return isToday && isActive;
        });

        if (activeForToday.length > 0) {
          const grouped = {};
          activeForToday.forEach(b => {
            const docId = b.doctorId._id || b.doctorId;
            if (!grouped[docId]) {
              grouped[docId] = {
                doctorId: docId,
                doctorName: b.doctorId.name,
                doctorAvatar: b.doctorId.avatar,
                time_slot: b.time_slot,
                date: new Date(b.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                tokens: []
              };
            }
            grouped[docId].tokens.push(b.queue_token_number);
          });
          
          const groupedArray = Object.values(grouped);
          setActiveBookings(groupedArray);
          
          groupedArray.forEach(g => {
            fetchLiveQueue(g.doctorId);
            socket.emit("joinQueueRoom", g.doctorId);
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const fetchLiveQueue = async (doctorId) => {
    try {
      const { data } = await axios.get(`/queue/live/${doctorId}`);
      if (data.success) {
        setLiveQueues(prev => ({
          ...prev,
          [doctorId]: data
        }));
      }
    } catch (error) {
      console.error("Failed to fetch live queue:", error);
    }
  };



  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchTerm) params.append("name", searchTerm);
      if (specialtyFilter) params.append("specialization", specialtyFilter);

      const { data } = await axios.get(`/patient/doctors?${params.toString()}`);
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Compact Live Queue Widget */}
      {activeBookings.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-2 px-2">
             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
             <h3 className="text-slate-700 font-bold text-sm tracking-widest uppercase">Live Queue Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeBookings.map((group) => {
              const liveData = liveQueues[group.doctorId];
              if (!liveData) return null;

              const currentServing = liveData.nowServing ? liveData.nowServing.token : "--";
              const currentStatus = liveData.nowServing ? liveData.nowServing.status : "--";

              return (
                <motion.div 
                  key={group.doctorId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
                    <Activity size={100} />
                  </div>
                  
                  <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-4">
                    {group.doctorAvatar ? (
                      <img src={group.doctorAvatar} alt={group.doctorName} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl border-2 border-slate-200">
                        {group.doctorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{group.doctorName}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{group.date} • {group.time_slot}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Your Tickets</span>
                      <span className="font-black text-slate-800">#{group.tokens.join(", #")}</span>
                    </div>

                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Live Status</span>
                      <span className="font-black text-emerald-900 flex items-center gap-2">
                        {currentServing !== "--" ? (
                          <>
                            Token #{currentServing} 
                            <span className={`text-[10px] ${currentStatus === "Completed" ? "bg-slate-200 text-slate-700" : "bg-emerald-200 text-emerald-800"} px-2 py-0.5 rounded-full uppercase tracking-wider font-bold`}>
                              {currentStatus === "Completed" ? "Done" : "Ongoing"}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold">Starting Soon</span>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formal Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-xl bg-blue-900 p-10 text-white shadow-md border border-blue-800"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-800/50 border border-blue-700 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-5"
              >
                <Sparkles size={14} /> AI Powered Diagnostics Available
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4"
              >
                Find & Book the <span className="text-blue-300">Best Doctors</span> for your Health
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-blue-100 text-base leading-relaxed opacity-90 max-w-xl"
              >
                Access premium healthcare with over 500+ verified specialists. 
                Get instant appointments and digital prescriptions in one secure place.
              </motion.p>
           </div>
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 }}
             className="hidden lg:flex items-center gap-4"
           >
              <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-lg min-w-[130px]">
                 <p className="text-2xl font-bold text-white">500+</p>
                 <p className="text-xs font-medium text-blue-200 mt-1 uppercase tracking-wide">Specialists</p>
              </div>
              <div className="text-center bg-blue-600 p-5 rounded-lg min-w-[130px] border border-blue-500 shadow-sm">
                 <p className="text-2xl font-bold text-white">24/7</p>
                 <p className="text-xs font-medium text-blue-100 mt-1 uppercase tracking-wide">Care Available</p>
              </div>
           </motion.div>
        </div>
      </motion.div>

      {/* Sophisticated Search & Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-20"
      >
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, specialization, or hospital..."
              className="w-full pl-11 pr-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full lg:w-72 relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <select
              className="w-full pl-11 pr-10 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-50 appearance-none text-gray-800 text-sm font-medium transition-all cursor-pointer"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <MapPin size={14} />
            </div>
          </div>

          <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-md transition-colors text-sm">
             Search
          </button>
          
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="text-gray-500 text-sm font-medium">Analyzing Database...</p>
          </div>
        ) : doctors.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {doctors.map(doc => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 text-gray-400">
              <UserSearch size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No Specialists Found</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
              We couldn't find any doctors matching your current criteria. 
              Try expanding your search or selecting a different specialization.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
