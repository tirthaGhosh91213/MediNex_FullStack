import React, { useState } from "react";
import { Star, Building2, Banknote, CalendarPlus } from "lucide-react";
import BookingModal from "./BookingModal";
import { motion } from "framer-motion";

const DoctorCard = ({ doctor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const broker = doctor.brokerId || {};
  const averageRating = doctor.average_rating || 0;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.div 
        variants={item}
        className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Header/Banner Area */}
        <div className="h-24 bg-gray-50 relative border-b border-gray-100 flex items-end">
           <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-xs font-semibold text-gray-700">
             <Star size={14} className="text-yellow-500" fill="currentColor" />
             <span>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
           </div>

           <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded bg-white p-1 border border-gray-200 shadow-sm">
                <img 
                  src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`} 
                  alt={doctor.name} 
                  className="w-full h-full rounded object-cover"
                />
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="pt-14 p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{doctor.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
          </div>
          
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-sm">{broker.clinic_name || "Private Practice"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Banknote size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">₹{doctor.fees} <span className="text-gray-500 font-normal">/ Session</span></span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2.5 rounded bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarPlus size={16} />
            Book Consult
          </button>
        </div>
      </motion.div>

      {isModalOpen && (
        <BookingModal 
          doctor={doctor} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default DoctorCard;
