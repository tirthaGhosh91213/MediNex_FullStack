import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, FileText, Download, Loader2, Calendar, FileType2, Eye, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PatientVaultModal = ({ patientId, onClose }) => {
  const [records, setRecords] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewRecord, setPreviewRecord] = useState(null);

  // Build a working URL — handles both old relative paths and new full URLs
  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:4000/${url}`;
  };

  const isPdf = (url) => url && url.toLowerCase().includes(".pdf");

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const { data } = await axios.get(`/broker/patient-records/${patientId}`);
        if (data.success) {
          setRecords(data.health_records || []);
          setPatientName(data.patientName || "Patient");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch patient records.");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetchVault();
    }
  }, [patientId]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Patient Health Vault
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Records for <span className="text-blue-600 font-bold">{patientName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading vault records...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center text-red-600 font-medium text-sm">
                {error}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileType2 className="text-slate-300" size={32} />
                </div>
                <h4 className="text-slate-700 font-bold text-lg">No Records Found</h4>
                <p className="text-slate-500 text-sm mt-1">This patient hasn't uploaded any documents yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record, index) => {
                  const fullUrl = getFileUrl(record.file_url);
                  const isRecPdf = isPdf(record.file_url);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={record._id || index}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group flex flex-col bg-white"
                    >
                      {/* Thumbnail */}
                      <div 
                        className="h-32 bg-slate-50 flex items-center justify-center relative cursor-pointer overflow-hidden"
                        onClick={() => setPreviewRecord(record)}
                      >
                        {isRecPdf ? (
                          <FileText size={40} className="text-red-300 group-hover:text-red-400 transition-colors" />
                        ) : (
                          <img
                            src={fullUrl}
                            alt={record.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                          <div className="bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={14} className="text-slate-700" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                            <FileText size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{record.title}</h4>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                              <Calendar size={12} />
                              {new Date(record.uploaded_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                            <Download size={14} />
                            View Document
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Inline Preview */}
        {previewRecord && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setPreviewRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-slate-800 text-sm">{previewRecord.title}</h4>
                <div className="flex items-center gap-2">
                  <a
                    href={getFileUrl(previewRecord.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                  >
                    <Download size={12} /> Download
                  </a>
                  <button onClick={() => setPreviewRecord(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50/50 min-h-[400px]">
                {isPdf(previewRecord.file_url) ? (
                  <iframe
                    src={getFileUrl(previewRecord.file_url)}
                    className="w-full h-[70vh] rounded-lg border border-slate-200"
                    title={previewRecord.title}
                  />
                ) : (
                  <img
                    src={getFileUrl(previewRecord.file_url)}
                    alt={previewRecord.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default PatientVaultModal;
