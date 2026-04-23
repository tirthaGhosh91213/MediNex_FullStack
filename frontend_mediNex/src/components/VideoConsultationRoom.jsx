import React, { useState, useEffect, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MonitorUp,
  MessageSquare,
  Users,
  Shield,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * VideoConsultationRoom Component
 * ───────────────────────────────
 * A boilerplate video consultation room for online bookings.
 *
 * Props:
 *   meetingLink  — The unique room ID generated when broker accepted the booking
 *                  (e.g. "mediconnect-room-550e8400-e29b-41d4-a716-446655440000")
 *   userName     — The current user's display name (patient or doctor)
 *   userRole     — "patient" or "doctor"
 *   onLeave      — Callback when the user exits the call
 *
 * ═══════════════════════════════════════════════════════════════
 * SDK INTEGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════
 *
 * RECOMMENDED: ZegoCloud (Easiest for MERN apps)
 * ────────────────────────────────────────────────
 * 1. Install: npm install @zegocloud/zego-uikit-prebuilt
 *
 * 2. Get credentials:
 *    - Sign up at https://www.zegocloud.com/
 *    - Create a project → get AppID and ServerSecret
 *    - Add to frontend .env:
 *        VITE_ZEGO_APP_ID=your_app_id
 *        VITE_ZEGO_SERVER_SECRET=your_server_secret
 *
 * 3. Replace the placeholder in this component with:
 *
 *    import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
 *
 *    useEffect(() => {
 *      const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
 *      const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
 *
 *      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
 *        appID,
 *        serverSecret,
 *        meetingLink,   // room ID
 *        Date.now().toString(), // unique user ID
 *        userName       // display name
 *      );
 *
 *      const zc = ZegoUIKitPrebuilt.create(kitToken);
 *      zc.joinRoom({
 *        container: videoContainerRef.current,
 *        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
 *        showScreenSharingButton: true,
 *      });
 *    }, [meetingLink, userName]);
 *
 * ═══════════════════════════════════════════════════════════════
 *
 * ALTERNATIVE: Agora SDK
 * ──────────────────────
 * 1. Install: npm install agora-rtc-sdk-ng
 * 2. Get App ID from https://www.agora.io/
 * 3. More setup required (channel management, token server)
 * 4. Better for large-scale apps, harder initial setup
 *
 * This component currently renders a PLACEHOLDER UI.
 * Drop in ZegoCloud or Agora to make the video functional.
 * ═══════════════════════════════════════════════════════════════
 */

const VideoConsultationRoom = ({
  meetingLink,
  userName = "User",
  userRole = "patient",
  onLeave,
}) => {
  // ── Local state for UI controls ─────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  // ── Call timer ──────────────────────────────────────────────
  useEffect(() => {
    if (!isCallActive) return;
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Copy meeting link ──────────────────────────────────────
  const copyMeetingLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      console.error("Failed to copy meeting link");
    }
  }, [meetingLink]);

  // ── End call ───────────────────────────────────────────────
  const handleEndCall = () => {
    setIsCallActive(false);
    onLeave?.();
  };

  // ── No meeting link ────────────────────────────────────────
  if (!meetingLink) {
    return (
      <div className="min-h-96 flex items-center justify-center bg-slate-900 rounded-2xl p-8">
        <div className="text-center">
          <Video size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">
            No Active Consultation
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            The meeting link will be available once the broker accepts your
            booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* ── Video Area (Placeholder for SDK) ───────────────── */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        {/* 
          ┌─────────────────────────────────────────────────┐
          │  SDK INTEGRATION POINT                          │
          │  Replace this div with a ref container:         │
          │  <div ref={videoContainerRef} className="..." />│
          │  ZegoCloud or Agora will render video here      │
          └─────────────────────────────────────────────────┘
        */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-400">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{userName}</p>
            <p className="text-slate-400 text-sm capitalize">{userRole}</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg px-4 py-2 inline-block">
            <p className="text-blue-400 text-xs font-medium">
              📹 Connect ZegoCloud SDK to enable live video
            </p>
          </div>
        </div>

        {/* Timer overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-mono">
            {formatDuration(callDuration)}
          </span>
        </div>

        {/* Encrypted badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-600/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Shield size={12} className="text-green-400" />
          <span className="text-green-400 text-xs font-medium">
            Encrypted
          </span>
        </div>

        {/* Participants */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Users size={14} className="text-white" />
          <span className="text-white text-xs">2 participants</span>
        </div>
      </div>

      {/* ── Meeting Info Bar ───────────────────────────────── */}
      <div className="px-4 py-3 bg-slate-800/80 border-t border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-slate-500 flex-shrink-0">Room:</span>
          <code className="text-xs text-slate-300 truncate max-w-48">
            {meetingLink}
          </code>
          <button
            onClick={copyMeetingLink}
            className="flex-shrink-0 p-1 hover:bg-slate-700 rounded transition"
          >
            {isCopied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* ── Control Bar ───────────────────────────────────── */}
      <div className="px-6 py-4 bg-slate-800 flex items-center justify-center gap-4">
        {/* Microphone toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3.5 rounded-full transition ${
            isMuted
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>

        {/* Camera toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3.5 rounded-full transition ${
            isVideoOff
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
          title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </motion.button>

        {/* Screen share */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          title="Share Screen"
        >
          <MonitorUp size={20} />
        </motion.button>

        {/* Chat */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-3.5 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
          title="Chat"
        >
          <MessageSquare size={20} />
        </motion.button>

        {/* End Call */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleEndCall}
          className="px-8 py-3.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition font-medium"
          title="End Call"
        >
          <PhoneOff size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VideoConsultationRoom;
