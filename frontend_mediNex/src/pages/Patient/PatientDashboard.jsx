import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Loader2 } from "lucide-react";
import DoctorCard from "./DoctorCard";

const PatientDashboard = () => {
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
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search doctor by name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all appearance-none text-slate-700 font-medium"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
        
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map(doc => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No doctors found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
