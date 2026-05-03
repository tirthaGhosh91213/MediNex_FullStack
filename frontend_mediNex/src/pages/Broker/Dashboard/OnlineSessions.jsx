import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Video, ShieldCheck, PlayCircle, Loader2, CalendarClock, User, Stethoscope, Link as LinkIcon, CheckCircle2, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OnlineSessions = () => {
  const { token } = useAuth();
  const backendUrl = "http://localhost:4000";
  
  const [groupedSessions, setGroupedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionInputs, setSessionInputs] = useState({});
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/broker/online-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        // Group by doctorId + time_slot
        const groups = {};
        const inputs = {};
        
        data.bookings.forEach(b => {
          const docId = b.doctorId?._id;
          if (!docId) return;
          const key = `${docId}_${b.time_slot}`;
          
          if (!groups[key]) {
            groups[key] = {
              id: key,
              doctor: b.doctorId,
              time_slot: b.time_slot,
              patients: [],
            };
            // initialize inputs if a meeting link exists
            inputs[key] = {
              meeting_link: b.meeting_link || "",
              host_code: ""
            };
          }
          groups[key].patients.push(b);
          // if any subsequent booking has a link, take it
          if (b.meeting_link && !inputs[key].meeting_link) {
            inputs[key].meeting_link = b.meeting_link;
          }
        });
        
        setGroupedSessions(Object.values(groups));
        setSessionInputs(inputs);
      }
    } catch (error) {
      console.error("Fetch Online Sessions Error:", error);
      toast.error("Failed to load online sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (groupId, field, val) => {
    setSessionInputs(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: val
      }
    }));
  };

  const handleShareCredentials = async (sessionGroup) => {
    setProcessing(prev => ({ ...prev, [`share_${sessionGroup.id}`]: true }));
    try {
      const generatedLink = `${window.location.origin}/telemedicine-room/${sessionGroup.id}?doctorId=${sessionGroup.doctor._id}`;

      const { data } = await axios.put(`${backendUrl}/api/broker/session/credentials`, 
        { 
          doctorId: sessionGroup.doctor._id,
          time_slot: sessionGroup.time_slot,
          meeting_link: generatedLink,
          host_code: "N/A" // host code is no longer needed since it's an inbuilt system
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        // Mark all patients in this group as having a meeting link
        setGroupedSessions(prev => prev.map(g => {
          if (g.id === sessionGroup.id) {
            return {
              ...g,
              patients: g.patients.map(p => ({ ...p, meeting_link: generatedLink }))
            };
          }
          return g;
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share credentials.");
    } finally {
      setProcessing(prev => ({ ...prev, [`share_${sessionGroup.id}`]: false }));
    }
  };

  // Doctor controls the queue flow from their TelemedicineRoom.
  // The clinic manager only initializes the session and monitors status.

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Video className="text-blue-600" size={32} /> Manage Online Sessions
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Create a single session link for the doctor and call patients one-by-one from the queue.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Sessions</span>
            <span className="text-xl font-black text-slate-800 leading-tight">{groupedSessions.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold tracking-wide">Loading sessions...</p>
        </div>
      ) : groupedSessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence>
            {groupedSessions.map((group) => (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col xl:flex-row"
              >
                {/* Doctor & Session Setup Panel */}
                <div className="xl:w-1/3 bg-slate-50 border-r border-gray-200 p-6 flex flex-col">
                  
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-center overflow-hidden shrink-0">
                      {group.doctor?.avatar ? (
                        <img src={group.doctor.avatar} alt="Doctor" className="w-full h-full object-cover" />
                      ) : (
                        <Stethoscope size={28} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Consultant</p>
                      <p className="font-bold text-slate-800 text-lg leading-tight">Dr. {group.doctor?.name}</p>
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm mt-1">
                        <CalendarClock size={14} /> {group.time_slot}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 mt-6">
                    <button 
                      onClick={() => handleShareCredentials(group)}
                      disabled={processing[`share_${group.id}`]}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {processing[`share_${group.id}`] ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                      Initialize & Email Doctor
                    </button>
                    {group.patients.some(p => p.meeting_link) && (
                      <p className="text-[11px] font-bold text-green-600 mt-2 flex items-center justify-center gap-1.5 bg-green-50 py-2 rounded-xl border border-green-200">
                        <CheckCircle2 size={14} /> Room ID generated & Doctor Notified.
                      </p>
                    )}
                  </div>
                </div>

                {/* Queue Panel */}
                <div className="xl:w-2/3 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      Patient Queue 
                      <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{group.patients.length}</span>
                    </h3>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {group.patients.map((patient, index) => (
                      <div key={patient._id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${patient.is_session_started ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 ${patient.is_session_started ? 'bg-green-500' : 'bg-slate-300'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{patient.patientId?.name || "Unknown Patient"}</p>
                            <p className="text-xs text-slate-500 font-medium">Token #{patient.queue_token_number || index + 1}</p>
                          </div>
                        </div>
                        
                        <div>
                          {patient.status === "Completed" ? (
                            <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle2 size={14} /> Completed</span>
                          ) : patient.is_session_started ? (
                            <span className="text-blue-600 font-bold text-sm bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-blue-200">
                              <Video size={16} className="animate-pulse" /> In Session
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold text-sm bg-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-200">
                              Waiting
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Video size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Online Sessions Today</h3>
          <p className="text-slate-500 mt-2 font-medium max-w-sm mx-auto">
            You don't have any online consultations scheduled for today.
          </p>
        </div>
      )}
    </div>
  );
};

export default OnlineSessions;
