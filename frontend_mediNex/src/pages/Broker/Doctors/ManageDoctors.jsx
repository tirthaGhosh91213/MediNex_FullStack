import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Plus, CheckCircle2, Clock, X, ImagePlus, Calendar, Users, ChevronDown, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import Cropper from 'react-easy-crop';
import { useAuth } from "../../../context/AuthContext";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}

const socket = io("http://localhost:4000");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Pediatrician", "Orthopedist", "Gynecologist", "ENT Specialist",
  "Ophthalmologist", "Psychiatrist", "Oncologist", "Urologist",
  "Gastroenterologist", "Endocrinologist", "Other"
];

const defaultForm = {
  name: "", email: "", phone: "", degree: "",
  specialization: "", custom_specialization: "",
  medical_reg_number: "", experience: "", fees: "", bio: "",
  max_patients_per_day: 20,
};

const defaultSchedule = [];

const ManageDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const [brokerNotifs, setBrokerNotifs] = useState([]);
  
  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // Edit slot & delete states
  const [editingSlotsDoctor, setEditingSlotsDoctor] = useState(null);
  const [deleteConfirmDoctor, setDeleteConfirmDoctor] = useState(null);

  // Audio beep (5 seconds) for broker notifications
  const playNotificationSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.1);
    osc.start();
    // 5 seconds tone
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
    osc.stop(ctx.currentTime + 5.1);
  };

  useEffect(() => {
    fetchDoctors();
    if (user?._id) {
      socket.emit("joinBrokerRoom", user._id);
    }
    socket.on("doctorApproved", (data) => {
      setBrokerNotifs((prev) => [data, ...prev]);
      toast.success(data.message, { duration: 8000, icon: "🎉" });
      playNotificationSound();
      fetchDoctors();
    });
    return () => socket.off("doctorApproved");
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/broker/doctors");
      if (data.success) setDoctors(data.doctors);
    } catch { toast.error("Failed to load doctors"); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "avatar") { 
        setImageToCrop(reader.result);
        setIsCropping(true);
      }
      else { setCertFile(file); setCertPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(previewUrl);
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      setAvatarFile(file);
      setIsCropping(false);
      setImageToCrop(null);
    } catch (e) {
      toast.error("Failed to crop image");
    }
  };

  const confirmDelete = async () => {
    try {
      const { data } = await axios.delete(`/broker/doctors/${deleteConfirmDoctor._id}`);
      if (data.success) {
        toast.success("Doctor removed from roster");
        setDeleteConfirmDoctor(null);
        fetchDoctors();
      }
    } catch (e) {
      toast.error("Failed to delete doctor");
    }
  };

  const handleSaveSlots = async (e) => {
    e.preventDefault();
    if (schedule.length === 0) { toast.error("Please add at least one schedule day."); return; }
    setSubmitting(true);
    try {
      const payload = {
        schedule,
        max_patients_per_day: formData.max_patients_per_day
      };
      const { data } = await axios.put(`/broker/doctors/${editingSlotsDoctor._id}/slots`, payload);
      if (data.success) {
        toast.success("Slots updated successfully!");
        setEditingSlotsDoctor(null);
        setSchedule([]);
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating slots");
    } finally { setSubmitting(false); }
  };

  const openEditSlots = (doc) => {
    setEditingSlotsDoctor(doc);
    setSchedule(doc.schedule || []);
    setFormData(p => ({ ...p, max_patients_per_day: doc.max_patients_per_day }));
  };

  const toggleDay = (day) => {
    setSchedule((prev) => {
      const exists = prev.find((s) => s.day === day);
      if (exists) return prev.filter((s) => s.day !== day);
      return [...prev, { day, from: "09:00", to: "13:00", max_patients: formData.max_patients_per_day }];
    });
  };

  const updateSlot = (day, field, value) => {
    setSchedule((prev) => prev.map((s) => s.day === day ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (schedule.length === 0) { toast.error("Please add at least one schedule day."); return; }
    setSubmitting(true);
    try {
      const payload = new FormData();
      const spec = formData.specialization === "Other" ? formData.custom_specialization : formData.specialization;
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "custom_specialization" && k !== "specialization") payload.append(k, v);
      });
      payload.append("specialization", spec);
      payload.append("schedule", JSON.stringify(schedule));
      if (avatarFile) payload.append("avatar", avatarFile);
      if (certFile) payload.append("registration_certificate", certFile);

      const { data } = await axios.post("/broker/doctors/add", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Doctor submitted for admin verification!");
        setIsModalOpen(false);
        setFormData(defaultForm);
        setSchedule([]);
        setAvatarFile(null); setAvatarPreview(null);
        setCertFile(null); setCertPreview(null);
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding doctor");
    } finally { setSubmitting(false); }
  };

  const f = (field, val) => setFormData((p) => ({ ...p, [field]: val }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Broker Notifications Banner */}
      <AnimatePresence>
        {brokerNotifs.map((n, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <p className="font-semibold text-emerald-800 text-sm">{n.message}</p>
            </div>
            <button onClick={() => setBrokerNotifs(p => p.filter((_, j) => j !== i))} className="text-emerald-500 hover:text-emerald-700 shrink-0"><X size={16} /></button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Doctor Roster</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your clinic's medical professionals</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors">
          <Plus size={20} /> Onboard Doctor
        </motion.button>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold text-lg">No doctors yet. Add your first doctor!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {doctors.map((doc, idx) => {
            const currentYear = new Date().getFullYear();
            const displayExp = doc.experience_started_year ? currentYear - doc.experience_started_year : doc.experience;
            
            return (
            <motion.div 
              key={doc._id} 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
            >
              {/* Colorful Accent Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>

              <div className="p-6 flex-1 flex flex-col">
                {/* Header: Avatar + Name + Actions */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-50 border-2 border-slate-100 shadow-sm shrink-0">
                        <img src={doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=EEF2FF&color=4F46E5&bold=true`} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">{doc.name}</h3>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider items-center gap-1 mt-1 ${doc.is_verified ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                        {doc.is_verified ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                        {doc.is_verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Always Visible Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditSlots(doc)} title="Edit Slots" className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:border-blue-600 shadow-sm">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmDoctor(doc)} title="Delete Doctor" className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors border border-red-100 hover:border-red-600 shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {/* Info block */}
                  <div className="mb-6">
                    <p className="text-blue-600 font-bold text-sm mb-1">{doc.specialization}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-semibold">{doc.degree}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                      <span className="text-slate-500 font-medium text-xs">{displayExp} yrs experience</span>
                    </div>
                  </div>

                  {/* Schedule Area */}
                  <div className="space-y-3 mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Schedule</p>
                    <div className="flex gap-2 flex-wrap">
                      {(doc.schedule || []).length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No slots assigned</span>
                      ) : (
                        <>
                          {(doc.schedule || []).slice(0, 4).map((s) => (
                            <span key={s.day} className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100/50 shadow-sm">{s.day.slice(0,3)}</span>
                          ))}
                          {(doc.schedule || []).length > 4 && <span className="text-xs text-slate-500 font-bold px-2 py-1.5">+{doc.schedule.length - 4} more</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-[1.25rem] border border-slate-200/60 mt-auto">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Consultation Fee</p>
                    <p className="text-xl font-black text-slate-800">₹{doc.fees}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Daily Capacity</p>
                    <p className="text-xl font-black text-slate-800">{doc.max_patients_per_day} <span className="text-xs text-slate-500 font-medium">pts</span></p>
                  </div>
                </div>

              </div>
            </motion.div>
          )})}
        </div>
      )}

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">

              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black text-white">Onboard New Doctor</h3>
                  <p className="text-blue-100 text-sm mt-0.5">All fields required for admin verification</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Form */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} id="doctor-form" className="p-6 space-y-6">

                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Doctor Profile Photo</label>
                    {avatarPreview ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 group">
                        <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                        <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                        <ImagePlus size={22} className="text-slate-400" />
                        <span className="text-xs text-slate-400 mt-1">Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "avatar")} />
                      </label>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Basic Information</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input type="text" required placeholder="Dr. Sarah Connor" value={formData.name} onChange={e => f("name", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                        <input type="email" required placeholder="doctor@clinic.com" value={formData.email} onChange={e => f("email", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal text-xs">(private)</span></label>
                        <input type="tel" placeholder="+91 98765..." value={formData.phone} onChange={e => f("phone", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Qualification</label>
                        <input type="text" required placeholder="MBBS, MD" value={formData.degree} onChange={e => f("degree", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience (yrs)</label>
                        <input type="number" min="0" placeholder="5" value={formData.experience} onChange={e => f("experience", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Specialization</p>
                    <div className="relative">
                      <select required value={formData.specialization} onChange={e => f("specialization", e.target.value)}
                        className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 pr-10">
                        <option value="" disabled>Select Specialization</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <AnimatePresence>
                      {formData.specialization === "Other" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <input type="text" required placeholder="Enter specialization..." value={formData.custom_specialization} onChange={e => f("custom_specialization", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-slate-800" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Registration */}
                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Registration & Fees</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Reg. Number</label>
                        <input type="text" required placeholder="MCI-123456" value={formData.medical_reg_number} onChange={e => f("medical_reg_number", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Fees (₹)</label>
                        <input type="number" required min="0" placeholder="500" value={formData.fees} onChange={e => f("fees", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800" />
                      </div>
                    </div>

                    {/* Registration Certificate Image */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Registration Certificate <span className="text-slate-400 font-normal text-xs">(image)</span></label>
                      {certPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-32">
                          <img src={certPreview} className="w-full h-full object-cover" alt="cert" />
                          <button type="button" onClick={() => { setCertFile(null); setCertPreview(null); }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors gap-2">
                          <ImagePlus size={20} className="text-slate-400" />
                          <span className="text-sm text-slate-500">Upload certificate image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "cert")} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Calendar size={14}/>Weekly Schedule</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500 font-semibold">Max patients/day:</span>
                        <input type="number" min="1" max="200" value={formData.max_patients_per_day}
                          onChange={e => { f("max_patients_per_day", parseInt(e.target.value)); setSchedule(p => p.map(s => ({...s, max_patients: parseInt(e.target.value)})));}}
                          className="w-16 text-center px-2 py-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    {/* Day Chips */}
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const active = schedule.find(s => s.day === day);
                        return (
                          <motion.button key={day} type="button" onClick={() => toggleDay(day)}
                            whileTap={{ scale: 0.9 }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {day.slice(0, 3)}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Time Slots for selected days */}
                    <AnimatePresence>
                      {schedule.map((slot) => (
                        <motion.div key={slot.day} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-sm font-bold text-blue-700 mb-3">{slot.day}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 font-semibold block mb-1">From</label>
                              <input type="time" value={slot.from} onChange={e => updateSlot(slot.day, "from", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 font-semibold block mb-1">To</label>
                              <input type="time" value={slot.to} onChange={e => updateSlot(slot.day, "to", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {schedule.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">Select days above to set time slots</p>
                    )}
                  </div>

                </form>
              </div>

              {/* Submit Button */}
              <div className="p-6 border-t border-slate-100 shrink-0">
                <motion.button type="submit" form="doctor-form" disabled={submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle2 size={18} /> Submit for Admin Verification</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Slots Modal */}
      <AnimatePresence>
        {editingSlotsDoctor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl flex flex-col shadow-2xl max-h-[90vh]">
              
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center shrink-0 rounded-t-3xl">
                <div>
                  <h3 className="text-xl font-black text-white">Edit Slots</h3>
                  <p className="text-blue-100 text-sm mt-0.5">{editingSlotsDoctor.name}</p>
                </div>
                <button onClick={() => setEditingSlotsDoctor(null)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSaveSlots} id="slots-form" className="space-y-6">
                  {/* Weekly Schedule Component */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Calendar size={14}/>Weekly Schedule</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500 font-semibold">Max patients/day:</span>
                        <input type="number" min="1" max="200" value={formData.max_patients_per_day}
                          onChange={e => { f("max_patients_per_day", parseInt(e.target.value)); setSchedule(p => p.map(s => ({...s, max_patients: parseInt(e.target.value)})));}}
                          className="w-16 text-center px-2 py-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const active = schedule.find(s => s.day === day);
                        return (
                          <button key={day} type="button" onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {schedule.map((slot) => (
                        <motion.div key={slot.day} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-sm font-bold text-blue-700 mb-3">{slot.day}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 font-semibold block mb-1">From</label>
                              <input type="time" value={slot.from} onChange={e => updateSlot(slot.day, "from", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 font-semibold block mb-1">To</label>
                              <input type="time" value={slot.to} onChange={e => updateSlot(slot.day, "to", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {schedule.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">Select days above to set time slots</p>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 shrink-0">
                <button type="submit" form="slots-form" disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle2 size={18} /> Save Slot Changes</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Cropping Modal */}
      <AnimatePresence>
        {isCropping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-xl h-[60vh] bg-black rounded-xl overflow-hidden mb-6">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="w-full max-w-xl flex items-center gap-4 bg-white p-4 rounded-xl">
              <span className="text-sm font-bold text-slate-500">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="flex-1 accent-blue-600"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => { setIsCropping(false); setImageToCrop(null); }} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">Cancel</button>
              <button onClick={handleCropConfirm} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                <CheckCircle2 size={18} /> Crop & Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmDoctor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white ring-1 ring-red-100">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Remove Doctor?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">Are you sure you want to remove <strong className="text-slate-800">{deleteConfirmDoctor.name}</strong> from your clinic roster? This action cannot be undone.</p>
              
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteConfirmDoctor(null)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all flex justify-center items-center gap-2">
                  <Trash2 size={18}/> Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManageDoctors;
