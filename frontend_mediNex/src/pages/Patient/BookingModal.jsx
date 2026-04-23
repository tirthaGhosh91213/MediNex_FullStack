import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, Calendar, Clock, Video, Home, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BookingModal = ({ doctor, onClose }) => {
  const [bookingMode, setBookingMode] = useState("Offline");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock time slots for now
  const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:30 PM", "06:00 PM"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !timeSlot) {
      toast.error("Please select both Date and Time Slot");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        doctorId: doctor._id,
        booking_mode: bookingMode,
        date: date,
        time_slot: timeSlot
      };

      const { data } = await axios.post("/patient/book", payload);
      
      if (data.success) {
        toast.success(data.message || "Booking created successfully!");
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Book Appointment</h3>
            <button onClick={onClose} className="text-blue-100 hover:text-white bg-blue-700/50 hover:bg-blue-700 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            <div className="mb-6 flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
               <img src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}`} alt={doctor.name} className="w-14 h-14 rounded-full" />
               <div>
                 <h4 className="font-bold text-slate-800">{doctor.name}</h4>
                 <p className="text-sm text-slate-500">{doctor.specialization}</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Booking Mode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Appointment Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${bookingMode === 'Offline' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                    <input type="radio" name="mode" className="hidden" checked={bookingMode === 'Offline'} onChange={() => setBookingMode('Offline')} />
                    <Home size={24} className="mb-2" />
                    <span className="font-semibold">Clinic Visit</span>
                  </label>
                  <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${bookingMode === 'Online' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                    <input type="radio" name="mode" className="hidden" checked={bookingMode === 'Online'} onChange={() => setBookingMode('Online')} />
                    <Video size={24} className="mb-2" />
                    <span className="font-semibold">Video Call</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600"/> Select Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                 {/* Time Dropdown (Simple for now) */}
                 <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600"/> Select Time
                  </label>
                  <select 
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    required
                  >
                    <option value="" disabled>Choose slot...</option>
                    {slots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center min-w-[140px]"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirm Edit"}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
