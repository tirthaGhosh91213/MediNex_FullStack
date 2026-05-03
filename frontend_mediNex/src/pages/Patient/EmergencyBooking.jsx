import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  X, AlertTriangle, MapPin, Loader2, Navigation, Stethoscope,
  Building2, Star, Zap, ChevronRight, CheckCircle2, Siren,
  Clock, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EmergencyBooking = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1=reason, 2=finding, 3=results, 4=confirm, 5=done
  const [reason, setReason] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);

  const emergencyReasons = [
    "Chest Pain / Heart Attack",
    "Difficulty Breathing",
    "Severe Allergic Reaction",
    "High Fever (>103°F)",
    "Severe Injury / Bleeding",
    "Sudden Severe Headache",
    "Abdominal Pain",
    "Loss of Consciousness",
    "Other Emergency",
  ];

  /* ── Step 1 → 2: Get location and find doctors ─────────────── */
  const handleProceed = () => {
    if (!reason.trim()) {
      toast.error("Please describe or select your emergency reason");
      return;
    }
    setStep(2);
    getUserLocation();
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        findNearbyDoctors(loc);
      },
      () => {
        setError("Unable to get your location. Please enable GPS and try again.");
        setStep(1);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const findNearbyDoctors = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `/patient/emergency/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=${searchRadius}`
      );
      if (data.success) {
        setDoctors(data.doctors);
        setStep(3);
      }
    } catch (err) {
      setError("Failed to find nearby doctors. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 4: Confirm and book ──────────────────────────────── */
  const handleEmergencyBook = async () => {
    if (!selectedDoctor) return;
    setBooking(true);
    try {
      const { data } = await axios.post("/patient/emergency/book", {
        doctorId: selectedDoctor._id,
        emergency_reason: reason,
      });
      if (data.success) {
        setStep(5);
        toast.success("Emergency booking created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  /* ═══════════════════════ RENDER ════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Siren size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Emergency Booking</h2>
                <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">Immediate Assistance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* STEP 1: Reason Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-5"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">What's your emergency?</h3>
                <p className="text-sm text-slate-400">Select or describe your condition for faster assistance.</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {emergencyReasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-3 ${
                      reason === r
                        ? "border-red-300 bg-red-50 text-red-700 shadow-sm"
                        : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 transition-all ${reason === r ? "border-red-500 bg-red-500" : "border-slate-300"}`} />
                    {r}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or describe briefly</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your emergency..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-400 focus:outline-none text-sm font-medium text-slate-700 resize-none bg-slate-50/50 placeholder:text-slate-300"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2 pt-2 pb-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Radius</label>
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">{searchRadius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  className="w-full accent-red-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={!reason.trim()}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Navigation size={16} /> Find Nearby Doctors
              </button>
            </motion.div>
          )}

          {/* STEP 2: Locating */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 flex flex-col items-center justify-center py-16 space-y-5"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
                <MapPin size={24} className="text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800">Locating you...</h3>
                <p className="text-sm text-slate-400 mt-1">Searching for doctors within {searchRadius}km radius</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">GPS Active</span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Results */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {doctors.length > 0 ? `${doctors.length} Doctor${doctors.length > 1 ? "s" : ""} Found` : "No Doctors Found"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Within {searchRadius}km of your current location</p>
                </div>
                <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-[10px] font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={10} /> Emergency
                </div>
              </div>

              {doctors.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium text-sm">No doctors available within {searchRadius}km.</p>
                  <p className="text-slate-400 text-xs mt-1">Please call emergency services: <strong>112</strong></p>
                  <button onClick={() => setStep(1)} className="mt-4 text-blue-600 text-sm font-semibold hover:underline">
                    ← Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {doctors.map((doc, idx) => {
                    const broker = doc.brokerId || {};
                    const isSelected = selectedDoctor?._id === doc._id;

                    return (
                      <motion.button
                        key={doc._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setSelectedDoctor(doc); setStep(4); }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                          isSelected
                            ? "border-red-300 bg-red-50 shadow-sm"
                            : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-md"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img
                            src={doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=f3f4f6&color=374151`}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{doc.name}</h4>
                          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">{doc.specialization}</p>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                            <Building2 size={11} />
                            <span className="text-[11px] font-medium truncate">{broker.clinic_name || "Clinic"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-black text-slate-800">₹{doc.fees}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Confirm */}
          {step === 4 && selectedDoctor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-5"
            >
              <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft size={16} /> Back to results
              </button>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm">
                    <img
                      src={selectedDoctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=f3f4f6&color=374151`}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{selectedDoctor.name}</h4>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedDoctor.specialization}</p>
                    <p className="text-xs text-slate-400 mt-1">{selectedDoctor.brokerId?.clinic_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fee</p>
                    <p className="text-lg font-black text-slate-800">₹{selectedDoctor.fees}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mode</p>
                    <p className="text-lg font-black text-slate-800">Walk-in</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Emergency Reason</p>
                <p className="text-sm font-semibold text-red-800">{reason}</p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                  This will create an immediate booking and notify the clinic. You should proceed to the clinic as soon as possible.
                </p>
              </div>

              <button
                onClick={handleEmergencyBook}
                disabled={booking}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-60"
              >
                {booking ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating Emergency Booking...</>
                ) : (
                  <><Siren size={18} /> Confirm Emergency Booking</>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center justify-center py-12 text-center space-y-5"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Booking Confirmed!</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
                  Your emergency appointment with <strong className="text-slate-700">{selectedDoctor?.name}</strong> has been created. 
                  The clinic has been notified immediately.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 w-full max-w-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  Please proceed to the clinic now
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all active:scale-95"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyBooking;
