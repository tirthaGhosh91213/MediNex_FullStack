import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CloudUpload, FileText, Image as ImageIcon, Loader2, Download, Archive } from "lucide-react";
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Archive className="text-blue-600" /> Digital Health Vault
           </h2>
           <p className="text-slate-500 font-medium">Your historical records stored securely</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all w-full sm:w-auto justify-center"
        >
          <CloudUpload size={20} /> Upload New Record
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
           <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {records.map((rec) => (
              <motion.div 
                key={rec._id}
                layout
                initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale:1}}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition group flex flex-col"
              >
                 <div className="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center border border-slate-100 group-hover:border-blue-200 transition-colors">
                    {/* Visual guess purely relying on extension, if available from URL */}
                    {rec.file_url.includes(".pdf") ? 
                       <FileText size={48} className="text-red-400 opacity-50" /> :
                       <ImageIcon size={48} className="text-blue-400 opacity-50" />
                    }
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-slate-800 line-clamp-1" title={rec.title}>{rec.title}</h3>
                   <p className="text-xs font-semibold text-slate-400 mt-1">
                      {new Date(rec.uploaded_at).toLocaleDateString()}
                   </p>
                 </div>
                 <a 
                   href={rec.file_url} 
                   target="_blank" rel="noreferrer"
                   className="mt-4 w-full py-2 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                 >
                    <Download size={16} /> View / Download
                 </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <Archive size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">Your Vault is Empty</h3>
           <p className="text-slate-500 mt-2 max-w-md mx-auto">
             Upload past prescriptions, X-rays, or blood reports to keep them accessible to your assigned doctors.
           </p>
        </div>
      )}

      {/* Upload Drawer/Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
             >
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600">
                 <h3 className="text-xl font-bold text-white">Upload Record</h3>
                 <button onClick={() => setShowUploadModal(false)} className="text-white bg-blue-700/50 p-2 rounded-full hover:bg-blue-700 transition">✕</button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto">
                 <form onSubmit={handleUploadSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Record Title</label>
                      <input 
                        type="text" required 
                        placeholder="e.g. Blood Report Jan 2026"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50 transition outline-none" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select File</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50">
                         <CloudUpload className="mx-auto text-slate-400 mb-3" size={32} />
                         <input 
                           type="file" 
                           ref={fileInputRef} 
                           required 
                           accept=".pdf,.png,.jpg,.jpeg"
                           className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 w-full"
                         />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center">PDF, JPG, or PNG files only. Max 5MB.</p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isUploading}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center"
                    >
                       {isUploading ? <Loader2 className="animate-spin" size={20} /> : "Upload to Vault"}
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
