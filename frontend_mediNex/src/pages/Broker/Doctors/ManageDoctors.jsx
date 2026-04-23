import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, CheckCircle2, Clock, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", specialization: "", medical_reg_number: "", fees: ""
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
       const { data } = await axios.get("/broker/doctors");
       if(data.success) setDoctors(data.doctors);
    } catch(err) {
       toast.error("Failed to load doctors");
    } finally {
       setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/broker/doctors/add", formData);
      if (data.success) {
        toast.success("Doctor added! Waiting for admin approval.");
        setIsAddModalOpen(false);
        setFormData({ name: "", email: "", specialization: "", medical_reg_number: "", fees: "" });
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding doctor");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
           <h2 className="text-2xl font-black text-slate-800">Doctor Roster</h2>
           <p className="text-slate-500 font-medium">Manage your clinic's professionals</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus size={20} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-white shadow-sm overflow-hidden">
                 <img src={doc.avatar || `https://ui-avatars.com/api/?name=${doc.name}`} alt={doc.name} className="w-full h-full object-cover"/>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${doc.is_verified ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                {doc.is_verified ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                {doc.is_verified ? "Verified" : "Pending"}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800">{doc.name}</h3>
            <p className="text-blue-600 font-semibold text-sm mb-4">{doc.specialization}</p>

            <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center mb-6 border border-slate-100">
               <div>
                 <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Consultation Fee</p>
                 <p className="font-black text-slate-700 text-lg">₹{doc.fees}</p>
               </div>
               <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
               <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                 <Edit size={16} /> Edit
               </button>
               <button className="flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
                 <Trash2 size={16} /> Remove
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Modal for Adding Doctor */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
             <motion.div 
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
             >
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600">
                 <h3 className="text-xl font-bold text-white">Onboard New Doctor</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-white bg-blue-700/50 p-2 rounded-full hover:bg-blue-700">✕</button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto">
                 <form onSubmit={handleAddSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Doctor Name</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="Dr. Sarah Connor" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                      <input type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Specialization</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="Cardiologist" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Medical Reg Number</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="Med-998877" value={formData.medical_reg_number} onChange={e => setFormData({...formData, medical_reg_number: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Consultation Fee (₹)</label>
                      <input type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="500" value={formData.fees} onChange={e => setFormData({...formData, fees: e.target.value})} />
                    </div>
                    
                    <button type="submit" className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors">Submit for Verification</button>
                 </form>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManageDoctors;
