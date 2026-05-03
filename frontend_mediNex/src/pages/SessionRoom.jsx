import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

const SessionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state to ensure component is fully mounted
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const jitsiRoomName = `MediNex_Consultation_${roomId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              MediNex Secure Consultation <ShieldCheck size={18} className="text-green-500" />
            </h1>
            <p className="text-slate-400 text-xs font-medium">End-to-End Encrypted Room: {jitsiRoomName}</p>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-white font-bold tracking-widest text-sm uppercase">Connecting to Secure Server...</p>
          </div>
        ) : (
          <iframe
            src={`https://meet.jit.si/${jitsiRoomName}#userInfo.displayName="${encodeURIComponent(user?.name || 'Guest')}"&config.prejoinPageEnabled=false&config.disableDeepLinking=true`}
            allow="camera; microphone; display-capture; fullscreen; autoplay"
            className="w-full h-full border-0"
            title="MediNex Consultation"
          />
        )}
      </div>
    </div>
  );
};

export default SessionRoom;
