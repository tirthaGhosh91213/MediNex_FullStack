import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, Star, Building2, MapPin, 
  GraduationCap, Award, Calendar, Clock, 
  Banknote, ShieldCheck, CheckCircle2, User, X
} from "lucide-react";
import { motion } from "framer-motion";
import BookingModal from "./BookingModal";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const backendUrl = "http://localhost:4000";

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/patient/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (error) {
        console.error("Failed to fetch doctor details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchDoctorDetails();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
        <button onClick={() => navigate("/patient/dashboard")} className="mt-4 text-blue-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const broker = doctor.brokerId || {};
  const averageRating = doctor.average_rating || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Top Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-700 w-full"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end -mt-16 relative">
            
            {/* Avatar */}
            <div 
              className="w-40 h-40 rounded-2xl bg-white p-1.5 border border-gray-200 shadow-md shrink-0 relative cursor-pointer group"
              onClick={() => setIsImageModalOpen(true)}
            >
              <img 
                src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`}
                alt={doctor.name}
                className="w-full h-full object-cover rounded-xl group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-2xl">
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
            </div>

            {/* Core Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                    <ShieldCheck className="text-blue-500" size={24} />
                  </div>
                  <p className="text-lg text-blue-600 font-medium">{doctor.specialization}</p>
                </div>
                
                {/* Action Button Desktop */}
                <div className="hidden md:block">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <Calendar size={18} />
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <GraduationCap size={18} className="text-gray-400" />
                  <span className="font-medium text-sm">{doctor.degree}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Award size={18} className="text-gray-400" />
                  <span className="font-medium text-sm">{doctor.experience}+ Years Exp.</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                  <Star size={18} className="text-yellow-500" fill="currentColor" />
                  <span className="font-bold text-sm text-yellow-700">{averageRating > 0 ? averageRating.toFixed(1) : "New"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> About Doctor
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {doctor.bio || `${doctor.name} is a highly qualified ${doctor.specialization} with over ${doctor.experience} years of experience in the medical field. Committed to providing the best patient care with formal and professional diagnosis methods.`}
            </p>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" /> Clinic & Fees
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Clinic Details</p>
                <p className="font-bold text-gray-900 text-lg">{broker.clinic_name || "Private Practice"}</p>
                <div className="flex items-start gap-2 mt-3 text-gray-600">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm leading-relaxed">{broker.location?.address || "Address not provided"}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-center">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Banknote size={16} /> Consultation Fee
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  ₹{doctor.fees} <span className="text-base font-medium text-gray-500">/ Session</span>
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star size={20} className="text-blue-600" fill="currentColor" /> Ratings & Reviews
             </h3>
             
             {doctor.ratings && doctor.ratings.length > 0 ? (
               <div className="space-y-6">
                 {doctor.ratings.map((rating, idx) => (
                   <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} fill={i < rating.score ? "currentColor" : "none"} className={i < rating.score ? "" : "text-gray-300"} />
                         ))}
                       </div>
                       <span className="text-sm font-medium text-gray-700">Patient Review</span>
                     </div>
                     <p className="text-gray-600 text-sm">{rating.review || "No written review provided."}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 <Star size={32} className="mx-auto text-gray-300 mb-3" />
                 <p className="text-gray-500 font-medium">No reviews yet.</p>
                 <p className="text-xs text-gray-400 mt-1">Be the first to review after your consultation.</p>
               </div>
             )}
          </div>

        </div>

        {/* Right Column (Schedule & Action) */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" /> Availability
            </h3>
            
            <div className="space-y-3 mb-8">
              {doctor.schedule && doctor.schedule.length > 0 ? (
                doctor.schedule.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="font-semibold text-gray-700 text-sm">{slot.day}</span>
                    <span className="text-sm font-medium text-gray-500">{slot.from} - {slot.to}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Schedule not available</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 size={20} className="text-green-500" />
                <p className="text-sm font-medium text-gray-700">Accepting new patients</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Book Consultation Now
              </button>
            </div>
          </div>

        </div>
      </div>

      {isModalOpen && (
        <BookingModal 
          doctor={doctor} 
          onClose={(e) => {
            if (e) e.stopPropagation();
            setIsModalOpen(false);
          }} 
        />
      )}

      {/* Full Screen Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              className="absolute top-4 right-4 z-[10000] text-white bg-gray-900/80 hover:bg-gray-800 p-2.5 rounded-full transition-all cursor-pointer shadow-lg backdrop-blur flex items-center justify-center border border-white/20"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsImageModalOpen(false); }}
            >
              <X size={24} className="pointer-events-none" />
            </button>
            <img 
              src={doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=f3f4f6&color=374151`}
              alt={doctor.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DoctorDetails;
