import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  X, Calendar, Clock, Video, Home, 
  Loader2, Award, GraduationCap, Users2, Info, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const BookingModal = ({ doctor: initialDoctor, onClose }) => {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [bookingMode, setBookingMode] = useState("Offline");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);
  const [nextToken, setNextToken] = useState(1);
  const [step, setStep] = useState(1); // 1: Booking, 2: Payment, 3: Success
  const [paymentData, setPaymentData] = useState({ method: 'UPI', upiId: '' });
  const [lastBooking, setLastBooking] = useState(null);

  const { token } = useAuth();
  const navigate = useNavigate();
  const backendUrl = "http://localhost:4000";

  // Fetch full doctor details and schedule
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/patient/doctors/${initialDoctor._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (error) {
        console.error("Fetch Doctor Details Error:", error);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchDetails();
  }, [initialDoctor._id, token]);

  // Fetch token count when date changes
  useEffect(() => {
    if (!date) return;
    const fetchTokenCount = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/patient/doctors/${doctor._id}?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setNextToken(data.bookingCount + 1);
        }
      } catch (error) {
        console.error("Fetch Token Count Error:", error);
      }
    };
    fetchTokenCount();
  }, [date, doctor._id, token]);

  // Helper to get available slots from doctor's schedule
  const getDaySchedule = () => {
    if (!date) return null;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDayName = days[new Date(date).getDay()];
    return doctor.schedule?.find(s => s.day === selectedDayName);
  };

  const scheduleForDay = getDaySchedule();

  const isTimePassed = () => {
    if (!date || !scheduleForDay || !scheduleForDay.to) return false;
    
    // Check if the selected date is today (local time)
    const selectedDate = new Date(date);
    const now = new Date();
    const isToday = selectedDate.getDate() === now.getDate() && 
                    selectedDate.getMonth() === now.getMonth() && 
                    selectedDate.getFullYear() === now.getFullYear();
    
    if (!isToday) return false;

    // Compare with schedule end time
    const [endHour, endMin] = scheduleForDay.to.split(":").map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    return currentHour > endHour || (currentHour === endHour && currentMin >= endMin);
  };

  const timeHasPassed = isTimePassed();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }

    if (!date || !timeSlot) {
      toast.error("Please select both Date and Time Slot");
      return;
    }

    if (!scheduleForDay) {
      toast.error(`Doctor is not available on ${new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}`);
      return;
    }

    setLoading(true);
    // Simulate payment delay
    setTimeout(async () => {
      try {
        const payload = {
          doctorId: doctor._id,
          booking_mode: bookingMode,
          date: date,
          time_slot: timeSlot
        };

        const { data } = await axios.post(`${backendUrl}/api/patient/book`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (data.success) {
          toast.success("Payment Successful! Appointment Confirmed.");
          setLastBooking(data.booking);
          setStep(3); // Move to Success Step
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to create booking");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const isFullyBooked = scheduleForDay && nextToken > scheduleForDay.max_patients;
  const availableDays = doctor.schedule?.map(s => s.day).join(", ") || "No schedule set";

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(e); }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 relative flex flex-col max-h-[90vh]"
        >
          {fetchingDetails ? (
            <div className="h-[500px] flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <>
              {/* Header Profile Section */}
              <div className="relative border-b border-gray-100 bg-gray-50 px-8 py-6 flex items-center gap-6">
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(e); }} 
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-md hover:bg-gray-200 transition-colors z-[1000] cursor-pointer"
                >
                  <X size={20} className="pointer-events-none" />
                </button>
                <div className="relative shrink-0">
                  <img 
                    src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`} 
                    alt={doctor.name} 
                    className="w-24 h-24 rounded border border-gray-200 object-cover shadow-sm bg-white" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-600 bg-blue-50 border border-blue-100 text-xs px-2.5 py-0.5 rounded font-medium">
                      {doctor.specialization}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 md:p-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center shadow-sm">
                          <GraduationCap className="mx-auto mb-2 text-gray-400" size={20} />
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Qualification</p>
                          <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{doctor.degree}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center shadow-sm">
                          <Award className="mx-auto mb-2 text-gray-400" size={20} />
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Experience</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{doctor.experience}+ Years</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center shadow-sm">
                          <Users2 className="mx-auto mb-2 text-gray-400" size={20} />
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Limit</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{scheduleForDay?.max_patients || doctor.max_patients_per_day}</p>
                        </div>
                      </div>

                      {/* Mode Selection */}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consultation Type</label>
                          <div className="flex bg-gray-100 p-1 rounded-md">
                            <button 
                              type="button"
                              onClick={() => setBookingMode("Offline")}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-all ${bookingMode === 'Offline' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              <Home size={16} /> Offline
                            </button>
                            <button 
                              type="button"
                              onClick={() => setBookingMode("Online")}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-all ${bookingMode === 'Online' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              <Video size={16} /> Online
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                           <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start gap-3 h-full">
                             <Info className="text-blue-500 shrink-0" size={18} />
                             <div>
                               <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Availability</p>
                               <p className="text-sm font-medium text-blue-900 mt-1">{availableDays}</p>
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400"/> Appointment Date
                          </label>
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium text-gray-900 transition-all text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Clock size={14} className="text-gray-400"/> Available Slot
                          </label>
                          <select 
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium text-gray-900 transition-all appearance-none cursor-pointer text-sm"
                            required
                          >
                            <option value="" disabled>Select Time...</option>
                            {scheduleForDay ? (
                              <option value={`${scheduleForDay.from} - ${scheduleForDay.to}`}>
                                {scheduleForDay.from} to {scheduleForDay.to}
                              </option>
                            ) : (
                              <option disabled>{date ? "No slots for this day" : "Pick a date first"}</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Token Preview / Fully Booked Alert */}
                      {date && (
                        <div className={`rounded-lg p-5 border ${(isFullyBooked || timeHasPassed) ? 'bg-red-50 border-red-200 text-center' : 'bg-blue-50 border-blue-100 flex items-center justify-between'}`}>
                          {timeHasPassed ? (
                            <>
                              <p className="text-red-500 text-xs font-semibold uppercase tracking-wide mb-1">Status</p>
                              <h4 className="text-lg font-bold text-red-700">Booking Closed for Today</h4>
                              <p className="text-red-500 text-sm mt-1">Doctor's slot ended at {scheduleForDay.to}</p>
                            </>
                          ) : isFullyBooked ? (
                            <>
                              <p className="text-red-500 text-xs font-semibold uppercase tracking-wide mb-1">Status</p>
                              <h4 className="text-lg font-bold text-red-700">Fully Booked for Today</h4>
                              <p className="text-red-500 text-sm mt-1">Please select another date</p>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-blue-500 text-xs font-semibold uppercase tracking-wide mb-1">Queue Status</p>
                                <p className="text-blue-600 text-sm mt-0.5">Estimated wait: {(nextToken - 1) * 15} mins</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-blue-700 block leading-none">#{nextToken}</span>
                                <span className="text-blue-500 text-xs font-medium">Your Token</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="pt-6 flex items-center justify-between gap-6 border-t border-gray-100 mt-2">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Consultation Fee</p>
                          <p className="text-2xl font-bold text-gray-900 mt-0.5">₹{doctor.fees}</p>
                        </div>
                        <button 
                          type="button"
                          disabled={!date || !timeSlot || isFullyBooked || timeHasPassed}
                          onClick={() => setStep(2)}
                          className="flex-1 md:w-48 py-3 font-medium text-white bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 rounded-md transition-colors flex items-center justify-center text-sm"
                        >
                          PROCEED TO PAY
                        </button>
                      </div>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                           <h4 className="text-lg font-semibold text-gray-900">Secure Payment</h4>
                           <div className="bg-white px-3 py-1 rounded border border-gray-200 text-sm font-medium text-gray-600">
                              Amount: ₹{doctor.fees}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div 
                             onClick={() => setPaymentData({ ...paymentData, method: 'UPI' })}
                             className={`p-4 rounded-md border transition-all cursor-pointer flex items-center gap-4 ${paymentData.method === 'UPI' ? 'border-blue-500 bg-white ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}
                           >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentData.method === 'UPI' ? 'border-blue-500' : 'border-gray-300'}`}>
                                 {paymentData.method === 'UPI' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">Pay via UPI (GPay/PhonePe)</span>
                           </div>
                           <div 
                             onClick={() => setPaymentData({ ...paymentData, method: 'Card' })}
                             className={`p-4 rounded-md border transition-all cursor-pointer flex items-center gap-4 ${paymentData.method === 'Card' ? 'border-blue-500 bg-white ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}
                           >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentData.method === 'Card' ? 'border-blue-500' : 'border-gray-300'}`}>
                                 {paymentData.method === 'Card' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">Credit / Debit Card</span>
                           </div>
                        </div>

                        {paymentData.method === 'UPI' && (
                          <motion.input 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            placeholder="Enter UPI ID (e.g. name@okaxis)"
                            className="w-full mt-4 px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-medium text-gray-900 text-sm"
                          />
                        )}
                      </div>

                      <div className="flex gap-4">
                         <button 
                           onClick={() => setStep(1)}
                           className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm border border-gray-200"
                         >
                           Back
                         </button>
                         <button 
                           onClick={handleSubmit}
                           disabled={loading}
                           className="flex-1 py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center text-sm"
                         >
                           {loading ? <Loader2 size={18} className="animate-spin" /> : `PAY ₹${doctor.fees} & CONFIRM`}
                         </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-4"
                    >
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                          <CheckCircle size={32} />
                        </motion.div>
                      </div>
                      
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h4>
                        <p className="text-gray-500 text-sm mt-2">Your appointment has been successfully scheduled.</p>
                      </div>

                      {bookingMode === 'Offline' && lastBooking && (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 inline-block mt-4">
                          <div className="bg-white p-3 rounded border border-gray-200 shadow-sm inline-block">
                            <QRCodeSVG 
                              value={JSON.stringify({
                                bookingId: lastBooking._id,
                                doctor: doctor.name,
                                date: date,
                                token: lastBooking.queue_token_number
                              })} 
                              size={150}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                             <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Token Number</p>
                             <p className="text-3xl font-bold text-blue-600 mt-1">#{lastBooking.queue_token_number}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-6">
                        <button 
                          onClick={onClose}
                          className="w-full py-3 font-medium text-white bg-gray-900 hover:bg-black rounded-md transition-colors text-sm"
                        >
                          DONE
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
