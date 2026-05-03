import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, X, Phone, User, Clock, MapPin, AlertTriangle } from "lucide-react";

/**
 * EmergencyAlertModal
 * ───────────────────
 * A fullscreen, 30-second ringing alert that plays when an emergency
 * booking is received by the clinic manager (Broker).
 *
 * Props:
 *   booking  — The booking object from the socket event
 *   onDismiss — Callback when alert is dismissed or auto-expires
 */
const EmergencyAlertModal = ({ booking, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // ── Start the alarm sound (siren-like pattern for 30s) ──────────
  const startAlarm = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Create a repeating siren pattern
      const playBeep = (startTime, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.setValueAtTime(0.5, startTime + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
        oscillatorsRef.current.push(osc);
      };

      // Schedule 30 seconds of siren beeps (alternating high-low tones)
      for (let i = 0; i < 30; i++) {
        const t = ctx.currentTime + i;
        playBeep(t, 880, 0.25);        // High tone
        playBeep(t + 0.3, 660, 0.25);  // Low tone
        playBeep(t + 0.6, 880, 0.15);  // High short
      }
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  // ── Stop the alarm sound ────────────────────────────────────────
  const stopAlarm = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      audioCtxRef.current = null;
    }
    oscillatorsRef.current = [];
  };

  // ── Start everything on mount ──────────────────────────────────
  useEffect(() => {
    startAlarm();

    // Countdown timer (30 → 0)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-dismiss after 30 seconds
    intervalRef.current = setTimeout(() => {
      handleDismiss();
    }, 30000);

    return () => {
      stopAlarm();
      clearInterval(timerRef.current);
      clearTimeout(intervalRef.current);
    };
  }, []);

  const handleDismiss = () => {
    stopAlarm();
    clearInterval(timerRef.current);
    clearTimeout(intervalRef.current);
    onDismiss();
  };

  const patientName = booking?.booking?.patientId?.name || "A Patient";
  const emergencyReason = booking?.booking?.emergency_reason || booking?.booking?.notes || "Emergency";
  const doctorName = booking?.booking?.doctorId?.name || "Doctor";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: "rgba(127, 29, 29, 0.85)", backdropFilter: "blur(8px)" }}
      >
        {/* Pulsing background rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-red-400/30"
              initial={{ width: 100, height: 100, opacity: 0.6 }}
              animate={{
                width: [100, 600 + i * 100],
                height: [100, 600 + i * 100],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Alert Card */}
        <motion.div
          initial={{ scale: 0.8, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Red Header */}
          <div className="relative bg-gradient-to-br from-red-600 to-red-700 px-6 py-8 text-white text-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Pulsing Siren Icon */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4"
            >
              <Siren size={36} className="text-white drop-shadow-lg" />
            </motion.div>

            <h2 className="relative z-10 text-2xl font-black tracking-tight">🚨 EMERGENCY ALERT</h2>
            <p className="relative z-10 text-red-100 text-sm font-semibold mt-1">
              Incoming Emergency Booking
            </p>

            {/* Countdown Badge */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Clock size={14} />
              <span className="font-black text-lg tabular-nums">{timeLeft}s</span>
            </motion.div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Emergency Reason */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                  Emergency Reason
                </p>
                <p className="text-sm font-bold text-red-800 leading-relaxed">
                  {emergencyReason}
                </p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Patient
                </p>
                <p className="text-sm font-bold text-slate-800">{patientName}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.97] shadow-lg"
              >
                <Phone size={16} />
                Acknowledge
              </button>
              <button
                onClick={handleDismiss}
                className="py-4 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all flex items-center justify-center active:scale-[0.97]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-semibold">
              Alert will auto-dismiss in {timeLeft} seconds
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmergencyAlertModal;
