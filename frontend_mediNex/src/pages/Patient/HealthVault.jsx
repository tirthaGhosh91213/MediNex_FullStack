import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CloudUpload, FileText, Image as ImageIcon, Loader2, Download, Archive, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HealthVault = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get("/patient/vault");
      if (data.success) {
        setRecords(data.health_records);
      }
    } catch (err) {
      toast.error("Failed to load your vault");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    
    if (!file || !title) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("health_record", file);

    try {
      // Must set content type to multipart/form-data
      const { data } = await axios.post("/patient/vault/upload", formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success("File securely vaulted");
        setShowUploadModal(false);
        setTitle("");
        fetchRecords();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck size={12} /> Military Grade Encryption
           </div>
           <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-3 flex items-center gap-4">
             Digital Health Vault
           </h2>
           <p className="text-slate-400 font-bold text-sm">Secure, permanent storage for all your medical documents.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="relative z-10 bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-slate-900/20 transition-all flex items-center gap-3 w-full lg:w-auto justify-center active:scale-95"
        >
          <CloudUpload size={20} /> Vault New Record
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
           <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Accessing Encrypted Vault...</p>
        </div>
      ) : records.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {records.map((rec) => (
              <motion.div 
                key={rec._id}
                variants={item}
                layout
                className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full"
              >
                 <div className="h-40 bg-slate-50 rounded-[1.75rem] mb-6 flex items-center justify-center border border-slate-50 relative overflow-hidden group-hover:bg-blue-50 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {rec.file_url.includes(".pdf") ? 
                       <FileText size={64} className="text-red-400 opacity-20 group-hover:opacity-40 transition-opacity" /> :
                       <ImageIcon size={64} className="text-blue-400 opacity-20 group-hover:opacity-40 transition-opacity" />
                    }
                    <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                       <Archive size={20} />
                    </div>
                 </div>
                 <div className="flex-1 px-2">
                   <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={rec.title}>{rec.title}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Vaulted {new Date(rec.uploaded_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                     </p>
                   </div>
                 </div>
                 <a 
                   href={rec.file_url} 
                   target="_blank" rel="noreferrer"
                   className="mt-8 w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all duration-300 active:scale-95"
                 >
                    <Download size={16} /> Access Document
                 </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-20 rounded-[3.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center"
        >
           <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 shadow-xl shadow-blue-50/50">
              <Archive size={40} />
           </div>
           <h3 className="text-3xl font-black text-slate-800 tracking-tight">Your Vault is Pristine</h3>
           <p className="text-slate-400 font-bold mt-4 max-w-md mx-auto leading-relaxed">
             Securely store prescriptions, X-rays, and medical reports. 
             Only you and your consulting specialists can access these files.
           </p>
        </motion.div>
      )}

      {/* Upload Drawer/Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-md">
             <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative"
             >
               <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                 <div>
                   <h3 className="text-2xl font-black tracking-tight">Upload Record</h3>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Secure Encryption Active</p>
                 </div>
                 <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">✕</button>
               </div>
               
               <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                 <form onSubmit={handleUploadSubmit} className="space-y-10">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Identity</label>
                      <input 
                        type="text" required 
                        placeholder="e.g. MRI Scan - Brain - Jan 2026"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-50 focus:border-blue-600/20 focus:outline-none bg-slate-50/50 font-bold text-slate-700 transition-all placeholder:text-slate-300" 
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Attachment</label>
                      <div className="group relative">
                        <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-12 text-center group-hover:border-blue-600/30 transition-all bg-slate-50/50 relative z-10">
                           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:text-blue-600 transition-all">
                              <CloudUpload size={32} />
                           </div>
                           <p className="text-sm font-black text-slate-800 mb-1">Click or Drag File</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PDF, PNG, JPG (Max 5MB)</p>
                           <input 
                             type="file" 
                             ref={fileInputRef} 
                             required 
                             accept=".pdf,.png,.jpg,.jpeg"
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                           />
                        </div>
                        <div className="absolute inset-0 bg-blue-600/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-blue-600/30 transition-all flex justify-center items-center active:scale-95 disabled:grayscale"
                    >
                       {isUploading ? <Loader2 className="animate-spin" size={24} /> : "Finalize Vault Upload"}
                    </button>
                 </form>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthVault;
