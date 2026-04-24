import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Loader2, Sparkles, UserSearch, MapPin } from "lucide-react";
import DoctorCard from "./DoctorCard";
import { motion } from "framer-motion";

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const specializations = [
    "Cardiologist", "Dermatologist", "Neurologist", 
    "Pediatrician", "Orthopedic", "General Physician"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specialtyFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (searchTerm) params.append("name", searchTerm);
      if (specialtyFilter) params.append("specialization", specialtyFilter);

      const { data } = await axios.get(`/patient/doctors?${params.toString()}`);
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
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
              <div className="text-center bg-blue-600 p-5 rounded-lg min-w-[130px] border border-blue-500 shadow-sm">
                 <p className="text-2xl font-bold text-white">24/7</p>
                 <p className="text-xs font-medium text-blue-100 mt-1 uppercase tracking-wide">Care Available</p>
              </div>
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
            {doctors.map(doc => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
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
  );
};

export default PatientDashboard;
