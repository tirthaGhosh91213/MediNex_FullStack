import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BellRing, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const AlarmSystem = () => {
  const { token, user } = useAuth();
  const [activeAlarm, setActiveAlarm] = useState(null); // stores the medicine that is ringing
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const [alarms, setAlarms] = useState([]);

  // Fetch Patient Profile to get alarms
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/patient/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success && data.patient?.medication_alarms) {
          setAlarms(data.patient.medication_alarms);
        }
      } catch (err) {
        console.error("Failed to fetch alarms for alarm system", err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // The Alarm Checker Interval
  useEffect(() => {
    if (!alarms.length) return;

    // Check every minute
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const timeString = `${currentHours}:${currentMinutes}`;

      // Check if any active medicine matches the current time
      const matchingMedicine = alarms.find(alarm => {
        // Simple logic: If addedAt + durationDays > now, it's active
        const addedAt = new Date(alarm.addedAt);
        const expiresAt = new Date(addedAt);
        expiresAt.setDate(expiresAt.getDate() + alarm.durationDays);
        
        if (now <= expiresAt) {
          return alarm.times.includes(timeString);
        }
        return false;
      });

      if (matchingMedicine && !activeAlarm) {
        triggerAlarm(matchingMedicine);
      }
    }, 60000); // exactly 1 minute

    return () => clearInterval(intervalId);
  }, [alarms, activeAlarm]);

  const triggerAlarm = (medicine) => {
    setActiveAlarm(medicine);

    // Play Audio
    if (!audioRef.current) {
      // Create audio object if it doesn't exist.
      // Make sure you have alarm.mp3 in the public folder.
      audioRef.current = new Audio("/alarm.mp3");
      audioRef.current.loop = true;
    }
    
    // Play with catch to avoid autoplay policy errors if user hasn't interacted
    audioRef.current.play().catch(e => console.warn("Browser blocked audio autoplay:", e));

    // Enforce EXACTLY 20-second limit
    timeoutRef.current = setTimeout(() => {
      stopAlarm();
    }, 20000);
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveAlarm(null);
  };

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-md bg-white rounded-3xl shadow-2xl border-2 border-indigo-500 overflow-hidden"
        >
          {/* Ringing Animation Background */}
          <div className="absolute inset-0 bg-indigo-50/50">
             <div className="absolute inset-0 bg-indigo-500/10 animate-ping"></div>
          </div>
          
          <div className="relative p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 animate-bounce">
               <BellRing className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Medication Time</h3>
              <p className="text-slate-600 font-medium mt-1">
                It's time to take your <strong className="text-indigo-600 font-black">{activeAlarm.medicineName}</strong>.
              </p>
              
              <button
                onClick={stopAlarm}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-colors active:scale-95 shadow-lg shadow-indigo-600/30"
              >
                I took it (Stop Alarm)
              </button>
            </div>
            
            <button 
              onClick={stopAlarm}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Progress Bar (20 seconds) */}
          <motion.div 
             initial={{ width: "100%" }}
             animate={{ width: "0%" }}
             transition={{ duration: 20, ease: "linear" }}
             className="h-1.5 bg-indigo-500 w-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlarmSystem;
