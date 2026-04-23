import React, { useState } from "react";
import { X, Mic, MicOff, Video as VidIcon, VideoOff, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VideoCallOverlay = ({ isOpen, onClose, doctorName }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col pt-10 pb-0">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          className="flex-1 flex flex-col relative h-full bg-slate-950 rounded-t-[40px] overflow-hidden shadow-2xl"
        >
          {/* Main Video View (Placeholder) */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-col">
             {videoOn ? (
               <div className="w-32 h-32 rounded-full border-4 border-slate-700 bg-slate-800 animate-pulse flex items-center justify-center text-slate-500 mb-6">
                 Connecting...
               </div>
             ) : (
               <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-6 text-4xl font-bold font-serif">
                 {doctorName?.charAt(0) || "D"}
               </div>
             )}
             <h2 className="text-white text-2xl font-bold">{doctorName}</h2>
             <p className="text-slate-400 mt-2">00:12</p>
          </div>

          {/* Self View Floating */}
          <div className="absolute top-6 right-6 w-32 h-44 bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-600 shadow-xl flex items-center justify-center">
             {!videoOn ? <VideoOff className="text-slate-500" /> : <span className="text-xs text-slate-400">You</span>}
          </div>

          {/* Controls Dock */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-xl px-8 py-4 rounded-full border border-slate-700 flex items-center gap-6 shadow-2xl">
              <button 
                onClick={() => setMicOn(!micOn)} 
                className={`p-4 rounded-full transition-colors ${micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                 {micOn ? <Mic size={24} /> : <MicOff size={24} />}
              </button>

              <button 
                onClick={onClose} 
                className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition w-16 h-16 flex items-center justify-center shadow-lg shadow-red-600/30"
              >
                 <PhoneOff size={28} />
              </button>

              <button 
                onClick={() => setVideoOn(!videoOn)} 
                className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                 {videoOn ? <VidIcon size={24} /> : <VideoOff size={24} />}
              </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoCallOverlay;
