import React, { useState } from "react";
import { Star, Building2, Banknote, CalendarPlus, ChevronRight } from "lucide-react";
import BookingModal from "./BookingModal";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const broker = doctor.brokerId || {};
  const averageRating = doctor.average_rating || 0;

  const isNew = () => {
    if (!doctor.createdAt) return false;
    const createdAt = new Date(doctor.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleCardClick = () => {
    navigate(`/patient/doctor/${doctor._id}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div 
        variants={item}
        whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer relative"
      >
        {/* Top pattern / gradient */}
        <div className="h-32 w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-800">
            <Star size={14} className="text-yellow-500" fill="currentColor" />
            <span>{averageRating > 0 ? averageRating.toFixed(1) : isNew() ? "New" : "N/A"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 flex-1 flex flex-col relative bg-white">
          {/* Avatar */}
          <div className="relative -mt-14 mb-5 w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-2xl bg-white p-1 border border-gray-100 shadow-md group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300">
              <img 
                src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`} 
                alt={doctor.name} 
                className="w-full h-full rounded-xl object-cover bg-gray-50"
              />
            </div>
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {doctor.name}
            </h3>
            <p className="text-[11px] font-bold text-blue-600 mt-2 uppercase tracking-widest bg-blue-50/80 px-3 py-1 rounded-full inline-block border border-blue-100/50">
              {doctor.specialization}
            </p>
          </div>
          
          <div className="space-y-4 mb-6 flex-1 bg-gray-50/50 p-4 rounded-xl border border-gray-50 group-hover:bg-blue-50/30 transition-colors duration-300">
            <div className="flex items-start gap-3 text-gray-600">
              <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-100 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors">
                <Building2 size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{broker.clinic_name || "Private Practice"}</span>
                <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{broker.clinic_address || broker.location?.address || "Location unavailable"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-100 text-gray-400 group-hover:text-blue-500 transition-colors">
                <Banknote size={14} />
              </div>
              <span className="text-sm font-bold text-gray-900">₹{doctor.fees} <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">/ Session</span></span>
            </div>
          </div>

          <button 
            onClick={handleBookClick}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 ease-out"></span>
            <CalendarPlus size={16} className="group-hover/btn:rotate-12 transition-transform duration-300" />
            Book Appointment
          </button>
        </div>
      </motion.div>

      {isModalOpen && (
        <BookingModal 
          doctor={doctor} 
          onClose={(e) => {
            if (e) e.stopPropagation();
            setIsModalOpen(false);
          }} 
        />
      )}
    </>
  );
};

export default DoctorCard;
