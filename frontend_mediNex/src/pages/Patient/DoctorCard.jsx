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

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
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
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={handleCardClick}
        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer relative"
      >
        {/* Subtle top gradient bar for formal look */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 to-blue-400 absolute top-0 left-0"></div>

        {/* Header/Banner Area */}
        <div className="h-28 bg-gradient-to-b from-gray-50 to-white relative border-b border-gray-100 flex items-end">
           <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm text-xs font-semibold text-gray-700">
             <Star size={14} className="text-yellow-500" fill="currentColor" />
             <span>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
           </div>

           <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-white shadow-md relative group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`} 
                  alt={doctor.name} 
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="pt-14 p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
              {doctor.name}
              <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
            </h3>
            <p className="text-sm font-medium text-blue-600 mt-1 uppercase tracking-wide">{doctor.specialization}</p>
          </div>
          
          <div className="space-y-3 mb-6 flex-1 border-t border-gray-50 pt-4">
            <div className="flex items-start gap-3 text-gray-600">
              <Building2 size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{broker.clinic_name || "Private Practice"}</span>
                <span className="text-xs text-gray-500">{broker.location?.address || "Location unavailable"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Banknote size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-900">₹{doctor.fees} <span className="text-xs text-gray-500 font-medium uppercase">/ Session</span></span>
            </div>
          </div>

          <button 
            onClick={handleBookClick}
            className="w-full py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <CalendarPlus size={16} />
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
