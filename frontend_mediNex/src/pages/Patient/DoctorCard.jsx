import React, { useState } from "react";
import { Star, MapPin, Building2, Banknote, CalendarPlus } from "lucide-react";
import BookingModal from "./BookingModal";

const DoctorCard = ({ doctor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const broker = doctor.brokerId || {};
  const averageRating = doctor.average_rating || 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col">
        {/* Header/Banner Area */}
        <div className="h-24 bg-blue-50 relative">
           <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md border border-slate-100">
                <img 
                  src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2563eb&color=fff`} 
                  alt={doctor.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
           </div>
           
           <div className="absolute top-4 right-4 flex gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-amber-500 border border-white/50">
             <Star size={16} fill="currentColor" />
             <span>{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
           </div>
        </div>

        {/* Content */}
        <div className="pt-12 p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
          <p className="text-blue-600 font-medium text-sm mt-1">{doctor.specialization} • {doctor.degree}</p>
          
          <div className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
            <div className="flex items-start gap-2">
              <Building2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="font-medium line-clamp-1">{broker.clinic_name || "Independent"}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{broker.clinic_address || "Location unavailable"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-emerald-600">₹{doctor.fees}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 w-full py-3 rounded-xl bg-slate-50 text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <CalendarPlus size={18} />
            Book Appointment
          </button>
        </div>
      </div>

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
