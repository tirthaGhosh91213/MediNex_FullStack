import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Calendar, Clock, Video, Ticket, CheckCircle2, Clock3, Navigation, Star } from "lucide-react";
import VideoCallOverlay from "./VideoCallOverlay";
import RatingModal from "./RatingModal";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeVideoCall, setActiveVideoCall] = useState(null); // stores booking obj
  const [reviewBooking, setReviewBooking] = useState(null); // stores booking obj for reviewing

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/patient/my-bookings");
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "In-Progress": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const openGoogleMaps = (broker) => {
     if (broker && broker.location && broker.location.lat && broker.location.lng) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${broker.location.lat},${broker.location.lng}`;
        window.open(url, "_blank");
     } else {
        alert("Location coordinates unavailable for this clinic.");
     }
  };

  return (
    <div className="space-y-6">
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-6">
          {bookings.map(booking => {
            const doctor = booking.doctorId || {};
            const broker = booking.brokerId || {};
            
            return (
              <div key={booking._id} className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row overflow-hidden hover:shadow-lg transition-all">
                
                {/* Info Block */}
                <div className="p-6 md:p-8 flex-1 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                   <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden shrink-0 shadow-sm">
                      <img 
                        src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2563eb&color=fff`} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-2xl font-black text-slate-800">{doctor.name}</h3>
                       <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                         {booking.status}
                       </span>
                     </div>
                     <p className="text-blue-600 font-bold mb-4">{doctor.specialization} • {broker.clinic_name}</p>
                     
                     <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                           <Calendar size={18} className="text-slate-400" />
                           {new Date(booking.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                           <Clock size={18} className="text-slate-400" />
                           {booking.time_slot}
                        </div>
                     </div>
                   </div>
                </div>

                {/* Advanced Action/Context Block */}
                <div className="bg-slate-50 p-6 xl:w-96 border-t xl:border-t-0 xl:border-l border-slate-100 flex flex-col justify-center">
                  
                  {booking.status === "Completed" ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                         <CheckCircle2 size={32} />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-4">Treatment Completed</h4>
                      <button 
                        onClick={() => setReviewBooking(booking)}
                        className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-400 hover:text-amber-500 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                      >
                         <Star size={18} /> Rate Experience
                      </button>
                    </div>
                  ) : booking.booking_mode === "Offline" ? (
                    <div className="space-y-4">
                       <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-4 shadow-sm relative overflow-hidden">
                          <Ticket size={32} className="text-amber-500 relative z-10" />
                          <div className="relative z-10 text-center">
                            <p className="text-xs uppercase font-extrabold text-slate-400 tracking-widest">Queue Token</p>
                            <p className="font-mono text-3xl font-black text-slate-800 leading-tight">
                               #{booking.queue_token_number > 0 ? booking.queue_token_number : "--"}
                            </p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => openGoogleMaps(broker)}
                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                       >
                         <Navigation size={18} /> Deep Link to Clinic
                       </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 inline-block">
                         <Video size={40} className="text-blue-500" />
                       </div>
                       <p className="font-bold text-slate-700 mb-4">Telemedicine Consultation</p>
                       <button 
                         disabled={booking.status === "Pending" || booking.status === "Completed"}
                         className="w-full px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                         onClick={() => setActiveVideoCall(booking)}
                       >
                         <Video size={20} /> Join Encrypted Call
                       </button>
                       {booking.status === "Pending" && <p className="text-xs text-slate-500 font-semibold mt-3 italic">Waiting for clinic to accept...</p>}
                    </div>
                  )}
                  
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <Calendar size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">No bookings yet</h3>
           <p className="text-slate-500 mt-2 max-w-md mx-auto">
             You haven't scheduled any appointments yet. Search for doctors to book your first health consultation.
           </p>
        </div>
      )}

      {/* Overlays */}
      <VideoCallOverlay 
        isOpen={!!activeVideoCall} 
        onClose={() => setActiveVideoCall(null)} 
        doctorName={activeVideoCall?.doctorId?.name} 
      />

      <RatingModal 
        isOpen={!!reviewBooking} 
        onClose={() => setReviewBooking(null)} 
        booking={reviewBooking} 
      />

    </div>
  );
};

export default MyBookings;
