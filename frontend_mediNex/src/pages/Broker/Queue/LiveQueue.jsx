import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Play, CheckCircle, AlertTriangle, MonitorPlay, Loader2 } from "lucide-react";
import { io } from "socket.io-client";

// Connect to socket server
const socket = io("http://localhost:4000");

const LiveQueue = () => {
  const [doctors, setDoctors] = useState([]);
  const [queues, setQueues] = useState({}); // { doctorId: { inProgress: bookingObj, upNext: bookingObj } }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorsAndQueues();

    // Socket Listeners
    socket.on("queueUpdated", (data) => {
      // Re-fetch all queue data to stay perfectly in sync
      fetchQueuesOnly();
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, []);

  const fetchDoctorsAndQueues = async () => {
    try {
      setLoading(true);
      // Fetch doctors for this broker
      const { data: docData } = await axios.get("/broker/doctors");
      if (docData.success) {
        setDoctors(docData.doctors);
      }
      await fetchQueuesOnly();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueuesOnly = async () => {
    try {
      // Fetch today's bookings for this broker
      const today = new Date().toISOString().split("T")[0];
      const { data: bookingData } = await axios.get(`/broker/bookings?date=${today}`);
      
      if (bookingData.success) {
        const bookings = bookingData.bookings;
        const newQueues = {};

        // Group by doctorId
        const byDoctor = {};
        bookings.forEach(b => {
          const docId = b.doctorId._id || b.doctorId;
          if (!byDoctor[docId]) byDoctor[docId] = [];
          byDoctor[docId].push(b);
        });

        // Determine current and next for each doctor
        Object.keys(byDoctor).forEach(docId => {
          const docsBookings = byDoctor[docId];
          const inProgress = docsBookings.find(b => b.status === "In-Progress");
          
          // Find next Accepted patient (sorted by queue_token_number already)
          const upNext = docsBookings.find(b => b.status === "Accepted");
          
          newQueues[docId] = { inProgress, upNext };
        });

        setQueues(newQueues);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextPatient = async (doctorId) => {
    const q = queues[doctorId];
    if (!q || !q.upNext) {
      toast.error("No pending patients in queue!");
      return;
    }
    
    // If there is currently an In-Progress patient, remind them to complete it first
    if (q.inProgress) {
      toast.error(`Please complete Token #${q.inProgress.queue_token_number} first.`);
      return;
    }

    try {
      const nextBookingId = q.upNext._id;
      const { data } = await axios.put(`/broker/bookings/${nextBookingId}/status`, { status: "In-Progress" });
      if (data.success) {
        toast.success("Called Next Patient to chamber");
        fetchQueuesOnly();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to call next patient");
    }
  };

  const handleComplete = async (doctorId) => {
    const q = queues[doctorId];
    if (!q || !q.inProgress) {
      toast.error("No patient is currently In-Progress.");
      return;
    }

    try {
      const currentBookingId = q.inProgress._id;
      const { data } = await axios.put(`/broker/bookings/${currentBookingId}/status`, { status: "Completed" });
      if (data.success) {
        toast.success("Marked Completed", { icon: "✅" });
        fetchQueuesOnly();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to mark as complete");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <MonitorPlay className="text-red-500" /> Live Queue Controller
        </h2>
        <p className="text-slate-500 font-medium">Manage chamber flows in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map(doc => {
          const q = queues[doc._id] || { inProgress: null, upNext: null };
          
          return (
          <div key={doc._id} className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="font-bold text-lg">{doc.name}</h3>
                <p className="text-blue-400 text-sm font-medium">{doc.specialization}</p>
              </div>
              <div className={`w-3 h-3 ${q.inProgress ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-500'} rounded-full`}></div>
            </div>

            {/* Token Tracker */}
            <div className="text-center relative z-10 mb-8">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Now Serving Token</p>
               <h1 className="text-7xl font-black text-white tabular-nums drop-shadow-md">
                 {q.inProgress ? `#${q.inProgress.queue_token_number}` : "--"}
               </h1>
            </div>

            {/* Next Up */}
            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 mb-6 border border-slate-700 relative z-10">
               <p className="text-xs text-slate-400 font-bold uppercase mb-1">Up Next</p>
               <p className="font-semibold text-blue-100 flex justify-between">
                 <span>{q.upNext ? q.upNext.patientId.name : "No pending patients"}</span>
                 {q.upNext && <span className="text-slate-400">#{q.upNext.queue_token_number}</span>}
               </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button 
                onClick={() => handleNextPatient(doc._id)}
                disabled={!!q.inProgress || !q.upNext}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Play size={18} /> Next
              </button>
              <button 
                onClick={() => handleComplete(doc._id)}
                disabled={!q.inProgress}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Complete
              </button>
            </div>

            {/* Decorative BG */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default LiveQueue;
