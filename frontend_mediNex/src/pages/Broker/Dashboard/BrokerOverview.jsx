import React, { useState, useEffect } from "react";
import { Users, CalendarClock, Activity, IndianRupee, MessageSquare, X, Send, ListOrdered, CheckCircle2, Stethoscope, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const BrokerOverview = () => {
  const { token } = useAuth();
  const backendUrl = "http://localhost:4000";

  const [activeDoctors, setActiveDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  // Queue Modal State
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [selectedQueueDoctor, setSelectedQueueDoctor] = useState(null);
  const [queuePatients, setQueuePatients] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const totalPatients = activeDoctors.reduce((s, d) => s + (d.totalPatientCount || 0), 0);
  const completedPatients = activeDoctors.reduce((s, d) => s + (d.completedPatientCount || 0), 0);
  const remainingPatients = totalPatients - completedPatients;

  const stats = [
    { label: "Today's Doctors", value: activeDoctors.length, trend: "Active today", icon: <Stethoscope size={24} className="text-purple-600" />, color: "bg-purple-50 border-purple-100", pulse: true },
    { label: "Total Patients", value: totalPatients, trend: "Booked today", icon: <Users size={24} className="text-blue-600" />, color: "bg-blue-50 border-blue-100" },
    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString("en-IN")}`, trend: "From completed", icon: <IndianRupee size={24} className="text-emerald-600" />, color: "bg-emerald-50 border-emerald-100" },
    { label: "Completed", value: completedPatients, trend: remainingPatients > 0 ? `${remainingPatients} remaining` : "All done!", icon: <CheckCircle2 size={24} className="text-green-600" />, color: "bg-green-50 border-green-100" },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const fetchRevenue = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/broker/analytics?timeframe=today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setTodayRevenue(data.totalRevenue);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchTodayDoctors = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/broker/today-doctors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) setActiveDoctors(data.activeDoctors);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (token) { fetchTodayDoctors(); fetchRevenue(); }
  }, [token]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !broadcastMessage) return;
    setBroadcasting(true); setBroadcastSuccess("");
    try {
      const { data } = await axios.post(`${backendUrl}/api/broker/broadcast`,
        { doctorId: selectedDoctorId, message: broadcastMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setBroadcastSuccess("Message broadcasted successfully!");
        setBroadcastMessage("");
        setTimeout(() => { setIsBroadcastModalOpen(false); setBroadcastSuccess(""); }, 2000);
      }
    } catch (e) { setBroadcastSuccess("Failed to send message."); }
    finally { setBroadcasting(false); }
  };

  const openBroadcastModal = (doctorId) => { setSelectedDoctorId(doctorId); setIsBroadcastModalOpen(true); };

  const openQueueModal = async (doctor) => {
    setSelectedQueueDoctor(doctor); setIsQueueModalOpen(true); setLoadingQueue(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/broker/today-patients/${doctor._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setQueuePatients(data.bookings);
    } catch (e) { console.error(e); }
    finally { setLoadingQueue(false); }
  };

  const handleCompletePatient = async (bookingId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/broker/bookings/${bookingId}/status`,
        { status: "Completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setQueuePatients(prev => prev.map(p => p._id === bookingId ? { ...p, status: "Completed" } : p));
        setActiveDoctors(prev => prev.map(d => d.doctor._id === selectedQueueDoctor._id
          ? { ...d, completedPatientCount: (d.completedPatientCount || 0) + 1 } : d));
        fetchRevenue();
      }
    } catch (e) { console.error(e); }
  };

  // Emergency Pause Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyDoctorId, setEmergencyDoctorId] = useState(null);
  const [emergencyDoctorName, setEmergencyDoctorName] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [sendingEmergency, setSendingEmergency] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState("");

  const openEmergencyModal = (doctorId, doctorName) => {
    setEmergencyDoctorId(doctorId);
    setEmergencyDoctorName(doctorName);
    setEmergencyMessage("");
    setEmergencySuccess("");
    setIsEmergencyModalOpen(true);
  };

  const handleEmergencyPause = async (e) => {
    e.preventDefault();
    if (!emergencyDoctorId || !emergencyMessage) return;
    setSendingEmergency(true);
    setEmergencySuccess("");
    try {
      const { data } = await axios.post(`${backendUrl}/api/broker/broadcast`,
        { doctorId: emergencyDoctorId, message: `⚠️ EMERGENCY PAUSE: ${emergencyMessage}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setEmergencySuccess("Emergency alert sent to all patients!");
        setEmergencyMessage("");
        setTimeout(() => { setIsEmergencyModalOpen(false); setEmergencySuccess(""); }, 2000);
      }
    } catch (e) {
      console.error(e);
      setEmergencySuccess("Failed to send emergency alert.");
    } finally { setSendingEmergency(false); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Morning, Clinic Manager! ☀️</h2>
          <p className="text-blue-100 max-w-lg text-lg">Your doctors are actively consulting. Manage queues and broadcast messages instantly.</p>
        </div>
        <div className="absolute -right-20 -top-40 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute right-40 -bottom-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl mix-blend-overlay"></div>
      </div>

      {/* Live Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className="p-6 rounded-3xl border shadow-sm flex flex-col h-full bg-white relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`}>{stat.icon}</div>
                {stat.badge && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
              </div>
              <div>
                <h3 className="text-slate-500 font-semibold mb-1">{stat.label}</h3>
                <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
                <p className="text-sm font-medium text-slate-400 mt-2">{stat.trend}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Doctors */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Activity size={24} className="text-blue-600" /> Today's Active Doctors</h3>
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>
        ) : activeDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDoctors.map((item) => (
              <motion.div key={item.doctor._id} whileHover={{ y: -5 }} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  <img src={item.doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.doctor.name)}`} alt={item.doctor.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.doctor.name}</h4>
                    <p className="text-sm text-blue-600 font-medium mt-1">{item.doctor.specialization}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 flex divide-x divide-gray-200 mt-auto">
                  <div className="flex-1 px-2 text-center">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Booked</div>
                    <div className="text-2xl font-black text-slate-800">{item.totalPatientCount}</div>
                  </div>
                  <div className="flex-1 px-2 text-center">
                    <div className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Completed</div>
                    <div className="text-2xl font-black text-green-600">{item.completedPatientCount || 0}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openQueueModal(item.doctor)} className="flex-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"><ListOrdered size={16} /> Queue</button>
                  <button onClick={() => openBroadcastModal(item.doctor._id)} className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"><MessageSquare size={16} /> Broadcast</button>
                </div>
                <button onClick={() => openEmergencyModal(item.doctor._id, item.doctor.name)} className="mt-3 w-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-red-100 hover:border-red-600">
                  <AlertTriangle size={16} /> Emergency Pause
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center"><Users size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium text-lg">No doctors have bookings for today.</p></div>
        )}
      </div>

      {/* Queue Modal */}
      <AnimatePresence>
        {isQueueModalOpen && selectedQueueDoctor && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
              <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-6 flex justify-between items-center text-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2"><ListOrdered size={22} /> Patient Queue</h3>
                  <p className="text-indigo-200 text-sm mt-1 font-medium">Dr. {selectedQueueDoctor.name}</p>
                </div>
                <button type="button" onClick={() => setIsQueueModalOpen(false)} className="text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} className="pointer-events-none" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex-1">
                {loadingQueue ? (
                  <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>
                ) : queuePatients.length === 0 ? (
                  <div className="text-center py-12 text-slate-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p className="font-medium text-lg">No patients booked today.</p></div>
                ) : (
                  <div className="space-y-3">
                    {queuePatients.map((booking) => (
                      <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white p-4 rounded-2xl border flex items-center gap-4 transition-all ${booking.status === "Completed" ? "border-green-100 shadow-sm opacity-75 bg-green-50/30" : "border-slate-200 shadow-md"}`}>
                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center text-white font-black leading-none ${booking.status === "Completed" ? "bg-green-500" : "bg-indigo-600 shadow-lg shadow-indigo-600/30"}`}>
                          <span className="text-[10px] uppercase opacity-90 tracking-widest mb-0.5">Tkt</span>
                          <span className="text-xl">{booking.queue_token_number || '-'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-lg truncate mb-1">{booking.patientId?.name || "Unknown Patient"}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{booking.booking_mode}</span>
                            <span className="text-xs font-bold text-slate-500">{booking.time_slot}</span>
                          </div>
                        </div>
                        <div>
                          {booking.status === "Completed" ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-5 py-2.5 rounded-xl font-bold border border-green-100"><CheckCircle2 size={18} /> Done</div>
                          ) : (
                            <button onClick={() => handleCompletePatient(booking._id)} className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 border border-indigo-100 hover:border-indigo-600"><CheckCircle2 size={18} /> Complete</button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {isBroadcastModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare size={22} /> Send Broadcast</h3>
                <button type="button" onClick={() => setIsBroadcastModalOpen(false)} className="text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} className="pointer-events-none" /></button>
              </div>
              <div className="p-8">
                <p className="text-gray-600 mb-6 font-medium leading-relaxed">This message will be sent instantly to all patients booked with this doctor today.</p>
                <form onSubmit={handleBroadcast}>
                  <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="E.g., The doctor is running 30 mins late..." className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] outline-none transition-all resize-none bg-gray-50 mb-4 font-medium" required></textarea>
                  {broadcastSuccess && (<div className={`p-3 rounded-xl mb-4 text-sm font-semibold ${broadcastSuccess.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{broadcastSuccess}</div>)}
                  <button type="submit" disabled={broadcasting || !broadcastMessage} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg">
                    {broadcasting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Send size={20} /> Send to All Patients</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Pause Modal */}
      <AnimatePresence>
        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-red-200">
              <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 flex justify-between items-center text-white">
                <h3 className="text-xl font-bold flex items-center gap-2"><AlertTriangle size={22} /> Emergency Pause</h3>
                <button type="button" onClick={() => setIsEmergencyModalOpen(false)} className="text-red-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} className="pointer-events-none" /></button>
              </div>
              <div className="p-8">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-medium leading-relaxed">
                    This will send an <strong>Emergency Pause</strong> alert to all patients booked with <strong>Dr. {emergencyDoctorName}</strong> today. Write a custom message below.
                  </p>
                </div>
                <form onSubmit={handleEmergencyPause}>
                  <textarea
                    value={emergencyMessage}
                    onChange={(e) => setEmergencyMessage(e.target.value)}
                    placeholder="E.g., Doctor is attending to a critical case. All appointments paused for 1 hour..."
                    className="w-full border border-red-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px] outline-none transition-all resize-none bg-red-50/30 mb-4 font-medium"
                    required
                  ></textarea>
                  {emergencySuccess && (
                    <div className={`p-3 rounded-xl mb-4 text-sm font-semibold ${emergencySuccess.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                      {emergencySuccess}
                    </div>
                  )}
                  <button type="submit" disabled={sendingEmergency || !emergencyMessage} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg">
                    {sendingEmergency ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><AlertTriangle size={20} /> Send Emergency Alert</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BrokerOverview;
