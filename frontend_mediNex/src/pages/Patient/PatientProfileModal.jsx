import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, BellOff, BellRing, Phone, Mail, Clock, Loader2, Camera, Plus, Trash2, Check, Music } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Cropper from "react-easy-crop";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = image.width
  canvas.height = image.height

  ctx.translate(image.width / 2, image.height / 2)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')
  if (!croppedCtx) return null

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      resolve(file)
    }, 'image/jpeg')
  })
};

const PatientProfileModal = ({ isOpen, onClose }) => {
  const { user, token, logout } = useAuth();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  
  // Avatar upload state
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState(null);
  const fileInputRef = useRef(null);
  
  // Cropper states
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [editTimes, setEditTimes] = useState([]);
  const [isSavingTimes, setIsSavingTimes] = useState(false);

  // Ringtone upload state
  const [customRingtone, setCustomRingtone] = useState("");
  const [isUploadingRingtone, setIsUploadingRingtone] = useState(false);
  const ringtoneInputRef = useRef(null);

  useEffect(() => {
    if (user?.avatar) setLocalAvatar(user.avatar);
  }, [user]);

  useEffect(() => {
    if (isOpen && token) {
      fetchProfile();
    } else {
      setEditingAlarmId(null); // Reset edit state when closed
    }
  }, [isOpen, token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:4000/api/patient/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setAlarms(data.patient.medication_alarms || []);
        if (data.patient.avatar) setLocalAvatar(data.patient.avatar);
        if (data.patient.custom_ringtone) setCustomRingtone(data.patient.custom_ringtone);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlarm = async (alarm) => {
    setTogglingId(alarm._id);
    try {
      const { data } = await axios.put(`http://localhost:4000/api/patient/alarms/${alarm._id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message);
        setAlarms(data.medication_alarms);
      }
    } catch (error) {
      toast.error("Failed to toggle alarm");
    } finally {
      setTogglingId(null);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImageSrc(imageUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleAvatarUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.jpg");

      const { data } = await axios.post("http://localhost:4000/api/patient/profile/avatar", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      if (data.success) {
        toast.success("Profile picture updated!");
        setLocalAvatar(data.patient.avatar);
        setImageSrc(null); // Close cropper modal
        
        // Page reload to reflect avatar globally in Navbar
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const startEditingTimes = (alarm) => {
    setEditingAlarmId(alarm._id);
    setEditTimes([...alarm.times]);
  };

  const handleTimeChange = (idx, val) => {
    const newTimes = [...editTimes];
    newTimes[idx] = val;
    setEditTimes(newTimes);
  };

  const handleSaveTimes = async (alarmId) => {
    if (editTimes.length === 0) {
      toast.error("Must have at least one time");
      return;
    }

    setIsSavingTimes(true);
    try {
      const { data } = await axios.put(`http://localhost:4000/api/patient/alarms/${alarmId}/times`, { times: editTimes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Times updated successfully!");
        setAlarms(data.medication_alarms);
        setEditingAlarmId(null);
      }
    } catch (error) {
      toast.error("Failed to update times");
    } finally {
      setIsSavingTimes(false);
    }
  };

  const handleRingtoneUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingRingtone(true);
    const formData = new FormData();
    formData.append("ringtone", file);

    try {
      const { data } = await axios.post("http://localhost:4000/api/patient/profile/ringtone", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      if (data.success) {
        toast.success("Custom ringtone updated successfully!");
        setCustomRingtone(data.patient.custom_ringtone);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload ringtone");
    } finally {
      setIsUploadingRingtone(false);
      if (ringtoneInputRef.current) ringtoneInputRef.current.value = "";
    }
  };

  const handleRemoveRingtone = async () => {
    setIsUploadingRingtone(true);
    try {
      const { data } = await axios.delete("http://localhost:4000/api/patient/profile/ringtone", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Custom ringtone removed.");
        setCustomRingtone("");
      }
    } catch (error) {
      toast.error("Failed to remove ringtone");
    } finally {
      setIsUploadingRingtone(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-[#F8FAFC] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between text-white shrink-0">
              <h2 className="text-xl font-black tracking-tight">Patient Profile</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative">
              {/* Profile Info */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative">
                
                {/* Avatar Upload Container */}
                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 mb-4 border-4 border-white shadow-xl group cursor-pointer overflow-hidden"
                >
                  {isUploading ? (
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                  ) : localAvatar ? (
                    <>
                      {/* Perfect cropping with aspect-square and object-cover */}
                      <img src={localAvatar} className="w-full h-full object-cover aspect-square rounded-full" alt="Avatar" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                         <Camera size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <User size={48} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                         <Camera size={24} />
                      </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <h3 className="text-xl font-black text-slate-800">{user?.name}</h3>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1 mb-4">Patient Account</p>
                
                <div className="w-full space-y-3 mt-2 text-left">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">{user?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Medication Alarms Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-800">My Alarms</h3>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {alarms.length} Total
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                ) : alarms.length === 0 ? (
                  <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-8 text-center text-slate-400">
                    <BellOff size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No medication alarms found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alarms.map((alarm) => {
                      const isActive = alarm.isActive !== false;
                      const isEditing = editingAlarmId === alarm._id;

                      return (
                        <div key={alarm._id} className={`bg-white p-5 rounded-2xl border ${isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'} shadow-sm relative overflow-hidden transition-all`}>
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                          
                          <div className="flex justify-between items-start pl-2 mb-3">
                            <div>
                              <h4 className={`font-bold ${isActive ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{alarm.medicineName}</h4>
                              <p className="text-xs font-medium text-slate-500 mt-1">Duration: {alarm.durationDays} Days</p>
                            </div>
                            <button
                              onClick={() => handleToggleAlarm(alarm)}
                              disabled={togglingId === alarm._id}
                              className={`${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1`}
                            >
                              {togglingId === alarm._id ? <Loader2 size={12} className="animate-spin" /> : (isActive ? <BellOff size={12} /> : <BellRing size={12} />)}
                              {isActive ? "Turn Off" : "Turn On"}
                            </button>
                          </div>

                          {/* Times Section */}
                          <div className="pl-2 border-t border-slate-100 pt-3">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="flex flex-col gap-2">
                                  {editTimes.map((time, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-500 w-16">Dose {idx + 1}:</span>
                                      <input 
                                        type="time" 
                                        value={time}
                                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-sm px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                                  <button onClick={() => setEditingAlarmId(null)} className="text-slate-500 text-xs font-bold px-3 py-2">Cancel</button>
                                  <button 
                                    onClick={() => handleSaveTimes(alarm._id)} 
                                    disabled={isSavingTimes}
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {isSavingTimes ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {alarm.times.map((time, idx) => (
                                  <div key={idx} className={`flex items-center gap-1.5 ${isActive ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-50 border-transparent text-slate-400'} border px-2.5 py-1 rounded-md text-xs font-semibold`}>
                                    <Clock size={10} className={isActive ? "text-blue-500" : "text-slate-400"} />
                                    {time}
                                  </div>
                                ))}
                                <button 
                                  onClick={() => startEditingTimes(alarm)}
                                  className="ml-auto text-blue-500 hover:text-blue-700 text-xs font-bold underline"
                                >
                                  Edit Times
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Ringtone Section */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <h3 className="text-lg font-black text-slate-800 mb-2">Custom Ringtone</h3>
                <p className="text-xs font-medium text-slate-500 mb-4">Upload your own music (.mp3, .wav) to play when it's time for your medication.</p>
                <input 
                  type="file" 
                  ref={ringtoneInputRef} 
                  onChange={handleRingtoneUpload} 
                  accept="audio/*" 
                  className="hidden" 
                />
                
                {customRingtone ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 rounded-xl p-3 w-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                        <Music size={16} /> <span className="text-sm">Custom Music Active</span>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest break-all">
                         {customRingtone.split('/').pop()}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full mt-1">
                      <button 
                        onClick={() => !isUploadingRingtone && ringtoneInputRef.current?.click()}
                        disabled={isUploadingRingtone}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl flex-1 transition-colors disabled:opacity-50 text-sm"
                      >
                        Change
                      </button>
                      <button 
                        onClick={handleRemoveRingtone}
                        disabled={isUploadingRingtone}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl flex-1 transition-colors disabled:opacity-50 text-sm"
                      >
                        {isUploadingRingtone ? "Wait..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => !isUploadingRingtone && ringtoneInputRef.current?.click()}
                    disabled={isUploadingRingtone}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 w-full disabled:opacity-50"
                  >
                    {isUploadingRingtone ? <Loader2 size={18} className="animate-spin" /> : <Music size={18} />}
                    {isUploadingRingtone ? "Uploading..." : "Upload Audio File"}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 shrink-0">
               <button 
                 onClick={logout}
                 className="w-full bg-slate-100 hover:bg-slate-200 text-red-500 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
               >
                 Sign Out
               </button>
            </div>
          </motion.div>

          {/* Cropper Modal */}
          <AnimatePresence>
            {imageSrc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/90 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-sm"
              >
                <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-black text-slate-800">Crop Profile Picture</h3>
                    <button onClick={() => setImageSrc(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Cropper Area */}
                  <div className="relative flex-1 bg-black/5 w-full min-h-[300px]">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>

                  {/* Controls */}
                  <div className="p-6 bg-white shrink-0 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 w-12">Zoom</span>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => setImageSrc(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAvatarUpload}
                        disabled={isUploading}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        Save Picture
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default PatientProfileModal;
