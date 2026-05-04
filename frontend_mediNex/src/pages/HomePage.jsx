import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Sparkles, Siren, Search, Filter, MapPin, Loader2, UserSearch,
  Star, Building2, Banknote, CalendarPlus
} from 'lucide-react';

const HomePage = () => {
  const { role, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const specializations = [
    "Cardiologist", "Dermatologist", "Neurologist", 
    "Pediatrician", "Orthopedic", "General Physician"
  ];

  useEffect(() => {
    if (!authLoading) {
      if (token && role) {
        navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
      }
    }
  }, [role, token, authLoading, navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("name", searchTerm);
        if (specialtyFilter) params.append("specialization", specialtyFilter);

        const { data } = await axios.get(`http://localhost:4000/api/patient/doctors?${params.toString()}`);
        if (data.success) {
          setDoctors(data.doctors);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [searchTerm, specialtyFilter]);

  if (authLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const isNew = (createdAt) => {
    if (!createdAt) return false;
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Formal Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-xl bg-blue-900 p-10 text-white shadow-md border border-blue-800"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
             <div className="max-w-2xl">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-800/50 border border-blue-700 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-5"
                >
                  <Sparkles size={14} /> AI Powered Diagnostics Available
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4"
                >
                  Find & Book the <span className="text-blue-300">Best Doctors</span> for your Health
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-100 text-base leading-relaxed opacity-90 max-w-xl"
                >
                  Access premium healthcare with over 500+ verified specialists. 
                  Get instant appointments and digital prescriptions in one secure place.
                </motion.p>
             </div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5 }}
               className="hidden lg:flex items-center gap-4"
             >
                <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-lg min-w-[130px]">
                   <p className="text-2xl font-bold text-white">500+</p>
                   <p className="text-xs font-medium text-blue-200 mt-1 uppercase tracking-wide">Specialists</p>
                </div>
                <button 
                   onClick={() => navigate('/login')}
                   className="text-center bg-red-600 hover:bg-red-700 p-5 rounded-lg min-w-[130px] border border-red-500 shadow-lg shadow-red-900/30 transition-all active:scale-95 cursor-pointer group"
                 >
                    <Siren size={24} className="mx-auto mb-1 text-white group-hover:animate-pulse" />
                    <p className="text-xs font-bold text-red-100 mt-1 uppercase tracking-wide">Emergency</p>
                 </button>
             </motion.div>
          </div>
        </motion.div>

        {/* Sophisticated Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-20"
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4">
            
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name, specialization, or hospital..."
                className="w-full pl-11 pr-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-800 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-72 relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <select
                className="w-full pl-11 pr-10 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-50 appearance-none text-gray-800 text-sm font-medium transition-all cursor-pointer"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                 <MapPin size={14} />
              </div>
            </div>

            <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-md transition-colors text-sm">
               Search
            </button>
            
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="relative">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
               <p className="text-gray-500 text-sm font-medium">Analyzing Database...</p>
            </div>
          ) : doctors.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {doctors.map(doctor => {
                const broker = doctor.brokerId || {};
                const averageRating = doctor.average_rating || 0;
                
                return (
                  <motion.div 
                    key={doctor._id}
                    variants={itemAnim}
                    whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                    onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer relative"
                  >
                    {/* Top pattern / gradient */}
                    <div className="h-32 w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-white relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-800">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        <span>{averageRating > 0 ? averageRating.toFixed(1) : isNew(doctor.createdAt) ? "New" : "N/A"}</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/login", { state: { redirectTo: `/doctors/view/${doctor._id}` } });
                        }}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 ease-out"></span>
                        <CalendarPlus size={16} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                        Book Appointment
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 text-gray-400">
                <UserSearch size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No Specialists Found</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                We couldn't find any doctors matching your current criteria. 
                Try expanding your search or selecting a different specialization.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
