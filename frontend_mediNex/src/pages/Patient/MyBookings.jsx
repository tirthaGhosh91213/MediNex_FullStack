import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Loader2, Calendar, Clock, Video, Ticket,
  CheckCircle2, Clock3, Navigation, Star,
  QrCode, X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import VideoCallOverlay from "./VideoCallOverlay";
import RatingModal from "./RatingModal";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeVideoCall, setActiveVideoCall] = useState(null); // stores booking obj
  const [reviewBooking, setReviewBooking] = useState(null); // stores booking obj for reviewing
  const [showQrModal, setShowQrModal] = useState(null); // stores booking obj for QR

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
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Accepted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "In-Progress": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const openGoogleMaps = (broker) => {
    if (broker && broker.location && broker.location.lat && broker.location.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${broker.location.lat},${broker.location.lng}`;
      window.open(url, "_blank");
    } else {
      alert("Location coordinates unavailable for this clinic.");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedBookings = [...bookings].sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingBookings = sortedBookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  });

  const pastBookings = sortedBookings.filter(b => {
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
  });

  const renderBookingCard = (booking, isExpiredSection) => {
    const doctor = booking.doctorId || {};
    const broker = booking.brokerId || {};
    return (
      <motion.div
        key={booking._id}
        variants={item}
        className={`bg-white rounded-lg border flex flex-col xl:flex-row overflow-hidden hover:shadow transition-shadow ${isExpiredSection ? 'border-gray-100 opacity-80 shadow-none' : 'border-gray-200 shadow-sm'}`}
      >
        {/* Info Block */}
        <div className="p-6 md:p-8 flex-1 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className={`w-20 h-20 rounded border overflow-hidden shrink-0 ${isExpiredSection ? 'bg-gray-50 border-gray-100 grayscale' : 'bg-gray-100 border-gray-200'}`}>
            <img
              src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=f3f4f6&color=374151`}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{doctor.specialization} • {broker.clinic_name}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-sm font-medium">
                  {booking.date ? new Date(booking.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }) : "TBA"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <Clock size={14} className="text-gray-500" />
                <span className="text-sm font-medium">{booking.time_slot}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Action/Context Block */}
        <div className={`p-6 md:p-8 xl:w-[350px] border-t xl:border-t-0 xl:border-l flex flex-col justify-center ${isExpiredSection ? 'bg-gray-50/50 border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
          {booking.status === "Completed" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-medium text-gray-900 mb-4 text-sm">Appointment Completed</h4>
              <button
                onClick={() => setReviewBooking(booking)}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Star size={16} className="text-gray-400" /> Rate Consultant
              </button>
            </div>
          ) : booking.booking_mode === "Offline" ? (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Queue Position</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {booking.queue_token_number > 0 ? `#${booking.queue_token_number}` : "--"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center">
                  <Ticket size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openGoogleMaps(broker)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation size={14} /> Maps
                </button>

                {isExpiredSection ? (
                  <div className="bg-gray-100 text-gray-500 border border-gray-200 font-medium text-sm py-2 px-4 rounded text-center flex items-center justify-center">
                    Expired
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQrModal(booking)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode size={14} /> Token
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-3">
                <Video size={24} />
              </div>
              <p className="font-medium text-gray-900 text-sm mb-4">Virtual Consultation</p>
              {isExpiredSection ? (
                <div className="w-full py-2 px-4 rounded bg-gray-100 border border-gray-200 text-gray-500 font-medium text-sm text-center">
                  Expired
                </div>
              ) : (
                <button
                  disabled={booking.status === "Pending" || booking.status === "Completed"}
                  className="w-full py-2 px-4 rounded bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2"
                  onClick={() => setActiveVideoCall(booking)}
                >
                  <Video size={16} /> Join Call
                </button>
              )}
              {booking.status === "Pending" && <p className="text-xs text-gray-500 mt-3">Awaiting confirmation</p>}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Medical Appointments</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your healthcare schedule.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
          <div className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded text-xs font-medium">
            Upcoming: {upcomingBookings.length}
          </div>
          <div className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded text-xs font-medium">
            History: {pastBookings.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading appointments...</p>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-12">
          {upcomingBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active & Upcoming</h3>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6"
              >
                {upcomingBookings.map((booking) => renderBookingCard(booking, false))}
              </motion.div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8 pt-8 border-t border-gray-100">Past & Expired</h3>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6"
              >
                {pastBookings.map((booking) => renderBookingCard(booking, true))}
              </motion.div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
            You don't have any appointments currently scheduled.
          </p>
        </div>
      )}

      {/* Overlays */}
      {activeVideoCall && (
        <VideoCallOverlay
          isOpen={!!activeVideoCall}
          onClose={() => setActiveVideoCall(null)}
          doctorName={activeVideoCall?.doctorId?.name}
        />
      )}

      {reviewBooking && (
        <RatingModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
        />
      )}

      {/* QR Modal Overlay */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl relative"
            >
              <button
                onClick={() => setShowQrModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h4 className="text-xl font-semibold text-gray-900">Entry Token</h4>
                <p className="text-gray-500 text-sm mt-1">Show this at the reception</p>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200 inline-block mb-6 shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingId: showQrModal._id,
                    doctor: showQrModal.doctorId?.name,
                    date: showQrModal.date,
                    token: showQrModal.queue_token_number
                  })}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Queue Number</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">#{showQrModal.queue_token_number}</p>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Valid on {new Date(showQrModal.date).toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;