import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  BadgeCheck,
  Info,
  GraduationCap,
  Briefcase,
  Stethoscope,
  Calendar,
  Clock,
  Check,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RelatedDoct from "../components/RelatedDoct";

// Appointments (Enhanced)
// - Time slots are horizontal with smooth scrolling + snap
// - Left/right controls for quick navigation
// - Auto-scroll to selected slot, keyboard navigation (arrow keys)
// - Improved micro-interactions and accessibility

export default function Appointments() {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotInx, setSlotIdx] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const timeContainerRef = useRef(null);
  const slotRefs = useRef([]);

  // generate slots
  const getAvailableSlots = () => {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() + i);

      if (i === 0) {
        const h = dayStart.getHours();
        if (h > 10) dayStart.setHours(h + 1, 0, 0, 0);
        else dayStart.setHours(10, 0, 0, 0);
      } else {
        dayStart.setHours(10, 0, 0, 0);
      }

      const endTime = new Date(dayStart);
      endTime.setHours(21, 0, 0, 0);

      const slots = [];
      const cursor = new Date(dayStart);
      while (cursor < endTime) {
        const formatted = cursor.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        slots.push({ datetime: new Date(cursor), time: formatted });
        cursor.setMinutes(cursor.getMinutes() + 30);
      }

      result.push(slots);
    }

    setDocSlots(result);
  };

  useEffect(() => {
    const doc = doctors?.find((d) => d._id === docId) ?? null;
    setDocInfo(doc);
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);

  // whenever selected time changes, auto-scroll slot into view
  useEffect(() => {
    if (!slotTime) return;
    const slots = docSlots[slotInx] || [];
    const idx = slots.findIndex((s) => s.time === slotTime);
    const ref = slotRefs.current[idx];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [slotTime, slotInx, docSlots]);

  // keyboard navigation for time slots
  useEffect(() => {
    const handler = (e) => {
      if (!docSlots[slotInx] || docSlots[slotInx].length === 0) return;
      const slots = docSlots[slotInx];
      const currentIndex = slotTime ? slots.findIndex((s) => s.time === slotTime) : -1;

      if (e.key === "ArrowRight") {
        const next = Math.min(slots.length - 1, currentIndex + 1);
        const time = next === -1 ? slots[0].time : slots[next].time;
        setSlotTime(time);
      } else if (e.key === "ArrowLeft") {
        const prev = Math.max(0, currentIndex - 1);
        const time = currentIndex === -1 ? slots[0].time : slots[prev].time;
        setSlotTime(time);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slotTime, slotInx, docSlots]);

  // helper: scroll container by width
  const scrollTimeContainer = (dir = "right") => {
    const el = timeContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleBook = () => {
    if (!slotTime) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 600);
      return;
    }
    setBookingOpen(true);
  };

  const confirmBooking = () => {
    setBookingOpen(false);
    setBookingConfirmed(true);
    setTimeout(() => setBookingConfirmed(false), 3000);
  };

  if (!docInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen pb-12 pt-8 px-4 md:px-10 flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md border border-white/30 overflow-hidden"
      >
        <div className="md:flex">
          <div className="md:w-1/3 p-6 flex items-center justify-center bg-gradient-to-b from-white/30 to-blue-50">
            <motion.img
              layout
              src={docInfo.image}
              alt={docInfo.name}
              className="w-40 h-40 rounded-xl object-cover shadow-lg border-2 border-white"
              whileHover={{ scale: 1.03, rotate: -1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>

          <div className="md:w-2/3 p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 inline-flex items-center gap-2">
                    {docInfo.name}
                    <BadgeCheck className="w-5 h-5 text-blue-500 drop-shadow-sm" />
                  </h2>
                  <p className="text-sm text-blue-600 font-medium">Verified Doctor</p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Fee</div>
                  <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    {currencySymbol}
                    {docInfo.fees}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm shadow-sm">
                  <GraduationCap size={16} /> {docInfo.degree}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm shadow-sm">
                  <Stethoscope size={16} /> {docInfo.specilaty}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm shadow-sm">
                  <Briefcase size={16} /> {docInfo.experience}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-1">
                  <Info className="w-4 h-4 text-blue-600" /> About
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{docInfo.about}</p>
              </div>
            </div>

            <div className="mt-4">
              {/* Day selector */}
              <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
                {docSlots.map((daySlots, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlotIdx(idx);
                      setSlotTime("");
                      // bring time container to start for the new day
                      if (timeContainerRef.current) timeContainerRef.current.scrollLeft = 0;
                    }}
                    className={`min-w-[88px] flex-shrink-0 px-4 py-2 rounded-xl cursor-pointer text-center shadow-sm transition-all duration-200 transform
                      ${slotInx === idx ? "bg-blue-600 text-white scale-105" : "bg-white/70 text-gray-800 hover:translate-y-[-3px]"}
                    `}
                    aria-pressed={slotInx === idx}
                    title={`Select ${daySlots[0] && daySlots[0].datetime.toLocaleDateString()}`}
                  >
                    <div className="text-xs opacity-90">{daySlots[0] && daysOfWeek[daySlots[0].datetime.getDay()]}</div>
                    <div className="text-lg font-medium mt-1">{daySlots[0] && daySlots[0].datetime.getDate()}</div>
                    <div className="text-[11px] opacity-70 mt-1">{daySlots[0] && daySlots[0].datetime.toLocaleDateString()}</div>
                  </button>
                ))}
              </div>

              {/* time slots horizontal scroller with controls */}
              <div className={`mt-4 p-4 rounded-xl border ${errorShake ? "animate-shake" : ""} bg-white/80`}> 
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div className="text-sm font-medium text-gray-700">Select a time</div>
                </div>

                <div className="relative">
                  {/* left control */}
                  <button
                    onClick={() => scrollTimeContainer("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/70 shadow hover:bg-white"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* scroll container */}
                  <div
                    ref={timeContainerRef}
                    className="no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-3 py-2 px-8"
                    style={{ WebkitOverflowScrolling: "touch" }}
                    tabIndex={0}
                    aria-label="Available time slots"
                  >
                    {docSlots[slotInx] && docSlots[slotInx].length > 0 ? (
                      docSlots[slotInx].map((slot, i) => (
                        <div
                          key={i}
                          ref={(el) => (slotRefs.current[i] = el)}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSlotTime(slot.time)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setSlotTime(slot.time);
                          }}
                          className={`snap-center flex-shrink-0 w-auto inline-flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none transition-transform transform
                            ${slotTime === slot.time ? "bg-blue-600 text-white scale-105" : "bg-gray-100 text-gray-800 hover:-translate-y-1"}
                          `}
                          title={`Book ${slot.time}`}
                        >
                          <div className="text-sm font-medium">{slot.time.toLowerCase()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No slots available</div>
                    )}
                  </div>

                  {/* right control */}
                  <button
                    onClick={() => scrollTimeContainer("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/70 shadow hover:bg-white"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Selected: <span className="font-medium">{slotTime || "none"}</span></div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBook}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-102 transform transition"
                    >
                      <Calendar className="w-4 h-4" /> Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal + toast (same as before) */}
      <AnimatePresence>
        {isBookingOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border" initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.98 }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Confirm Appointment</h3>
                  <p className="text-sm text-gray-600 mt-1">Please confirm your booking details</p>
                </div>
                <button onClick={() => setBookingOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <div>{docSlots[slotInx] && docSlots[slotInx][0] && docSlots[slotInx][0].datetime.toLocaleDateString()}</div>
                  </div>
                  <div className="font-medium">{slotTime}</div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <div>Fee</div>
                  </div>
                  <div className="font-medium">{currencySymbol}{docInfo.fees}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={confirmBooking} className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-102 transition">
                  <Check className="w-4 h-4" /> Confirm
                </button>
                <button onClick={() => setBookingOpen(false)} className="flex-1 border px-4 py-2 rounded-lg">Cancel</button>
              </div>
              <RelatedDoct docId={docId} specilaty={docInfo.specilaty}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingConfirmed && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-8 right-8 z-50 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border">
            <div className="p-2 rounded-full bg-green-100 text-green-700">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Appointment booked</div>
              <div className="text-xs text-gray-500">We will send a confirmation shortly</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{` 
        .animate-shake { animation: shake 0.6s; }
        @keyframes shake { 10%,90%{transform:translateX(-1px);} 20%,80%{transform:translateX(2px);} 30%,50%,70%{transform:translateX(-4px);} 40%,60%{transform:translateX(4px);} }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
