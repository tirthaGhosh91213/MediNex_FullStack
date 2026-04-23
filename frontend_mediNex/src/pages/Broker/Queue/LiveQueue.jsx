import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Play, CheckCircle, AlertTriangle, MonitorPlay } from "lucide-react";
import { io } from "socket.io-client";

// Connect to socket server
const socket = io("http://localhost:4000");

const LiveQueue = () => {
  const [doctors, setDoctors] = useState([]);
  const [activeQueues, setActiveQueues] = useState({});

  useEffect(() => {
    fetchDoctorsAndQueues();

    // Socket Listeners
    socket.on("queueUpdated", (data) => {
      setActiveQueues(prev => ({
        ...prev,
        [data.doctorId]: data.nowServing
      }));
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, []);

  const fetchDoctorsAndQueues = async () => {
    try {
      // First fetch doctors for this broker
      const { data } = await axios.get("/broker/doctors");
      if (data.success) {
        setDoctors(data.doctors);
        
        // Then fetch active queue status for each (mocking logic here for UI representation)
        // In reality, this would be an API call to get today's queue status for each doctor.
        const mockQueues = {};
        data.doctors.forEach(d => {
          mockQueues[d._id] = 1; // Start token
        });
        setActiveQueues(mockQueues);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextPatient = async (doctorId) => {
    // Conceptually hitting the status API for the next patient
    toast.success("Called Next Patient to chamber");
    
    // Optimistic UI update
    setActiveQueues(prev => ({
      ...prev,
      [doctorId]: (prev[doctorId] || 0) + 1
    }));
  };

  const handleComplete = async (doctorId) => {
    // Conceptually hitting the complete route
    toast("Marked Completed", { icon: "✅" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <MonitorPlay className="text-red-500" /> Live Queue Controller
        </h2>
        <p className="text-slate-500 font-medium">Manage chamber flows in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div key={doc._id} className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="font-bold text-lg">{doc.name}</h3>
                <p className="text-blue-400 text-sm font-medium">{doc.specialization}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
            </div>

            {/* Token Tracker */}
            <div className="text-center relative z-10 mb-8">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Now Serving Token</p>
               <h1 className="text-7xl font-black text-white tabular-nums drop-shadow-md">
                 #{activeQueues[doc._id] || "--"}
               </h1>
            </div>

            {/* Next Up (Mock Data for visual representation) */}
            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 mb-6 border border-slate-700 relative z-10">
               <p className="text-xs text-slate-400 font-bold uppercase mb-1">Up Next</p>
               <p className="font-semibold text-blue-100 flex justify-between">
                 <span>Patient Name</span>
                 <span className="text-slate-400">#{ (activeQueues[doc._id] || 0) + 1 }</span>
               </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button 
                onClick={() => handleNextPatient(doc._id)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Play size={18} /> Next
              </button>
              <button 
                onClick={() => handleComplete(doc._id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Complete
              </button>
              <button 
                className="col-span-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-400 border border-slate-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-1"
              >
                <AlertTriangle size={18} /> Emergency Pause
              </button>
            </div>

            {/* Decorative BG */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveQueue;
