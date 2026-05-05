import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, BellOff, Phone, Mail, Clock, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const PatientProfileModal = ({ isOpen, onClose }) => {
  const { user, token, logout } = useAuth();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchProfile();
    }
  }, [isOpen, token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4000/api/patient/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setAlarms(data.patient.medication_alarms || []);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    setDeletingId(alarmId);
    try {
      const { data } = await axios.delete(`http://localhost:4000/api/patient/alarms/${alarmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Alarm turned off successfully!");
        setAlarms(data.medication_alarms);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to turn off alarm");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-[#F8FAFC] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between text-white shrink-0">
              <h2 className="text-xl font-black tracking-tight">Patient Profile</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative">
              {/* Profile Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 shadow-inner mb-4 overflow-hidden border-4 border-white shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800">{user?.name}</h3>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1 mb-4">Patient Account</p>
                
                <div className="w-full space-y-3 mt-2 text-left">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">{user?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Medication Alarms Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800">My Alarms</h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {alarms.length} Active
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                ) : alarms.length === 0 ? (
                  <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-8 text-center text-slate-400">
                    <BellOff size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No active medication alarms.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alarms.map((alarm) => (
                      <div key={alarm._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-start pl-2">
                          <div>
                            <h4 className="font-bold text-slate-800">{alarm.medicineName}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">Duration: {alarm.durationDays} Days</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAlarm(alarm._id)}
                            disabled={deletingId === alarm._id}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {deletingId === alarm._id ? <Loader2 size={12} className="animate-spin" /> : <BellOff size={12} />}
                            Turn Off
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 pl-2">
                          {alarm.times.map((time, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600">
                              <Clock size={10} className="text-blue-500" />
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 shrink-0">
               <button 
                 onClick={logout}
                 className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
               >
                 Sign Out
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PatientProfileModal;
