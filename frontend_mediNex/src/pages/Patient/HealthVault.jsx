import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CloudUpload, FileText, Image as ImageIcon, Loader2, Download,
  Archive, ShieldCheck, Trash2, Eye, X, Plus, FilePlus2, CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HealthVault = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data } = await axios.get("/patient/vault");
      if (data.success) setRecords(data.health_records);
    } catch {
      toast.error("Failed to load your vault");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:4000/${url.replace(/\\/g, "/")}`;
  };

  const isPdf = (url) => url && url.toLowerCase().includes(".pdf");

  /* ── File Handling ─────────────────────────────────────────── */
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((f) => ({
      file: f,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const resetUploadForm = () => {
    selectedFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setSelectedFiles([]);
    setTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Upload Submit ─────────────────────────────────────────── */
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Please enter a document name"); return; }
    if (selectedFiles.length === 0) { toast.error("Please select at least one file"); return; }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    selectedFiles.forEach((f) => formData.append("health_record", f.file));

    try {
      const { data } = await axios.post("/patient/vault/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success(`${selectedFiles.length} file(s) securely vaulted!`);
        resetUploadForm();
        setShowUploadModal(false);
        fetchRecords();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Delete ────────────────────────────────────────────────── */
  const handleDelete = async (recordId) => {
    if (!window.confirm("Permanently remove this record from your vault?")) return;
    setDeletingId(recordId);
    try {
      const { data } = await axios.delete(`/patient/vault/${recordId}`);
      if (data.success) {
        toast.success("Record removed");
        setRecords(data.health_records);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Animations ────────────────────────────────────────────── */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26 } },
  };

  /* ═══════════════════════ RENDER ════════════════════════════ */
  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Header Banner ──────────────────────────────────────── */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/[0.03] rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 lg:p-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-emerald-100">
              <ShieldCheck size={11} /> End-to-End Encrypted
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Digital Health Vault
            </h2>
            <p className="text-slate-400 font-medium text-sm mt-2 max-w-md">
              Your medical documents, securely stored. Only you and your consulting doctors can access these files.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2.5 w-full lg:w-auto justify-center active:scale-[0.97] hover:-translate-y-0.5"
          >
            <CloudUpload size={18} /> Upload New Record
          </button>
        </div>
      </div>

      {/* ── Records Grid ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <div className="w-10 h-10 border-[3px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em]">Loading Vault…</p>
        </div>
      ) : records.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {records.map((rec) => {
            const fullUrl = getFileUrl(rec.file_url);
            const isRecPdf = isPdf(rec.file_url);

            return (
              <motion.div
                key={rec._id}
                variants={cardVariants}
                layout
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/[0.04] hover:border-blue-200/60 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setPreviewRecord(rec)}
                  className="h-40 bg-slate-50 flex items-center justify-center relative cursor-pointer overflow-hidden border-b border-slate-50"
                >
                  {isRecPdf ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={36} className="text-red-300 group-hover:text-red-400 transition-colors" />
                      <span className="text-[9px] font-black text-red-300 uppercase tracking-widest">PDF</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={fullUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                      <div className="hidden flex-col items-center justify-center absolute inset-0 bg-slate-50">
                        <ImageIcon size={36} className="text-slate-200" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all group-hover:scale-100 scale-75">
                      <Eye size={15} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3
                    className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors"
                    title={rec.title}
                  >
                    {rec.title}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                    {new Date(rec.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>

                  {/* Action Row */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-colors active:scale-95"
                    >
                      <Download size={13} /> Open
                    </a>
                    <button
                      onClick={() => handleDelete(rec._id)}
                      disabled={deletingId === rec._id}
                      className="py-2 px-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-100 hover:border-red-200 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {deletingId === rec._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-16 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
            <Archive size={36} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Vault is Empty</h3>
          <p className="text-slate-400 font-medium mt-3 max-w-sm leading-relaxed text-sm">
            Upload prescriptions, lab reports, X-rays, and other medical records to keep them safe and accessible.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Upload Your First Record
          </button>
        </motion.div>
      )}

      {/* ═══════════ Upload Modal / Drawer ═══════════════════════ */}
      <AnimatePresence>
        {showUploadModal && (
          <div
            className="fixed inset-0 z-[9999] flex justify-end bg-slate-900/50 backdrop-blur-sm"
            onClick={() => { resetUploadForm(); setShowUploadModal(false); }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Upload to Vault</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={10} /> Secure Encryption Active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetUploadForm(); setShowUploadModal(false); }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white relative z-[10000] cursor-pointer"
                >
                  <X size={18} className="pointer-events-none" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleUploadSubmit} className="p-8 space-y-8">

                  {/* Step 1: Title */}
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[9px] font-black">1</span>
                      Document Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blood Test Report - May 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500/30 focus:outline-none bg-slate-50/50 font-semibold text-slate-700 transition-all placeholder:text-slate-300 text-sm"
                    />
                  </div>

                  {/* Step 2: Files */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[9px] font-black">2</span>
                      Attach Files
                    </label>

                    {/* File List */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <AnimatePresence>
                          {selectedFiles.map((f, idx) => (
                            <motion.div
                              key={f.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group/file"
                            >
                              {/* Thumbnail */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                                {f.preview ? (
                                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText size={20} className="text-red-400" />
                                )}
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 truncate">{f.file.name}</p>
                                <p className="text-[10px] font-semibold text-slate-400">
                                  {(f.file.size / 1024 / 1024).toFixed(2)} MB • Page {idx + 1}
                                </p>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeFile(f.id)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Drop Zone / Add More */}
                    <div className="relative">
                      <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
                          selectedFiles.length > 0
                            ? "border-blue-200 bg-blue-50/30 py-5"
                            : "border-slate-200 hover:border-blue-400/40 bg-slate-50/30"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {selectedFiles.length > 0 ? (
                            <>
                              <FilePlus2 size={24} className="text-blue-500" />
                              <p className="text-xs font-bold text-blue-600">Add More Pages</p>
                              <p className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 5MB each)</p>
                            </>
                          ) : (
                            <>
                              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all mb-1">
                                <CloudUpload size={28} />
                              </div>
                              <p className="text-sm font-bold text-slate-700">Click to select files</p>
                              <p className="text-[10px] text-slate-400 font-medium">PDF, JPG, PNG (Max 5MB each, up to 10 files)</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFilesSelected}
                          accept=".pdf,.png,.jpg,.jpeg"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary + Submit */}
                  {selectedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <p className="text-xs font-semibold text-emerald-700">
                          <span className="font-black">{selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}</span> ready to be securely vaulted
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading || !title.trim()}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} /> Encrypting & Uploading…
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} /> Finalize Vault Upload
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ Preview Modal ══════════════════════════════ */}
      <AnimatePresence>
        {previewRecord && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setPreviewRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{previewRecord.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(previewRecord.uploaded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <a
                    href={getFileUrl(previewRecord.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={13} /> Download
                  </a>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewRecord(null); }}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors relative z-[10000] cursor-pointer"
                  >
                    <X size={18} className="text-slate-500 pointer-events-none" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50/30 min-h-[400px] p-4">
                {isPdf(previewRecord.file_url) ? (
                  <iframe
                    src={getFileUrl(previewRecord.file_url)}
                    className="w-full h-[75vh] rounded-lg border border-slate-200"
                    title={previewRecord.title}
                  />
                ) : (
                  <img
                    src={getFileUrl(previewRecord.file_url)}
                    alt={previewRecord.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthVault;
