import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, X, Building2, UserCircle2, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";

const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState("brokers"); // "brokers" | "doctors"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, [activeTab]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      if (activeTab === "brokers") {
        const { data } = await axios.get("/admin/brokers/pending");
        if (data.success) setItems(data.brokers || []);
      } else {
        const { data } = await axios.get("/admin/doctors/pending");
        if (data.success) setItems(data.doctors || []);
      }
    } catch (error) {
      toast.error(`Failed to fetch pending ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (activeTab === "brokers") {
        if(action === "approve"){
           const { data } = await axios.put(`/admin/brokers/approve/${id}`);
           if(data.success) toast.success("Broker Approved Successfully");
        } else {
           // Mock reject hook
           toast.success("Broker Rejected");
        }
      } else {
        if(action === "approve"){
           const { data } = await axios.put(`/admin/doctors/verify/${id}`);
           if(data.success) toast.success("Doctor Verified Successfully");
        } else {
           toast.success("Doctor Rejected");
        }
      }
      // remove from list optimistically
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-800">Approval Queues</h2>
           <p className="text-slate-500 font-medium">Manage platform onboarding security limits</p>
        </div>
        
        {/* Animated Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex">
          <button 
            onClick={() => setActiveTab("brokers")}
            className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 ${activeTab === 'brokers' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {activeTab === "brokers" && <motion.div layoutId="approvalTab" className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10" />}
            Pending Clinics
          </button>
          <button 
            onClick={() => setActiveTab("doctors")}
            className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 ${activeTab === 'doctors' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {activeTab === "doctors" && <motion.div layoutId="approvalTab" className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10" />}
            Pending Doctors
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : items.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-5 font-bold text-slate-600 text-sm">Entity Details</th>
                <th className="p-5 font-bold text-slate-600 text-sm hidden md:table-cell">Contact Info</th>
                <th className="p-5 font-bold text-slate-600 text-sm text-center">Documentation</th>
                <th className="p-5 font-bold text-slate-600 text-sm text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.tr 
                    layout 
                    initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0, x: -50}} 
                    key={item._id} className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'brokers' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                           {activeTab === "brokers" ? <Building2 size={24} /> : <UserCircle2 size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{activeTab === "brokers" ? item.clinic_name : item.name}</p>
                          <p className="text-sm font-semibold text-slate-500 mt-0.5">
                             {activeTab === "brokers" ? `Trade Auth: ${item.trade_license_number}` : `Reg: ${item.medical_reg_number}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                       <p className="text-sm font-semibold text-slate-800">{item.email}</p>
                       <p className="text-xs text-slate-500 mt-1">{item.phone}</p>
                    </td>
                    <td className="p-5 text-center">
                       <button className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition">
                         <FileText size={16} /> View Docs
                       </button>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(item._id, "approve")} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors" title="Approve">
                          <Check size={20} />
                        </button>
                        <button onClick={() => handleAction(item._id, "reject")} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Reject">
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-slate-400" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">All clear</h3>
             <p className="text-slate-500 font-medium">No pending approvals in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalQueue;
