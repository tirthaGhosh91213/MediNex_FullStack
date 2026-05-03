import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Video, Mic, MicOff, VideoOff, PhoneOff, User, Loader2, PlayCircle, ShieldCheck, MessageSquare, Maximize, Minimize, Send, X } from "lucide-react";
import { toast } from "react-hot-toast";

const TelemedicineRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get("doctorId");

  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);

  // WebRTC & Media States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const mainContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Chat & Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // STUN Servers for WebRTC
  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  useEffect(() => {
    fetchQueue();
    setupSocket();
    setupMedia();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const fetchQueue = async () => {
    try {
      // We don't have token because Doctor opens from email.
      // We rely on the public-ish endpoint we just created
      const { data } = await axios.get(`http://localhost:4000/api/queue/doctor-session/${doctorId}/${roomId}`);
      if (data.success) {
        setDoctorInfo(data.doctor);
        // Exclude completed patients
        const activeQueue = data.queue.filter(q => q.status !== "Completed");
        setQueue(activeQueue);
        if (activeQueue.length > 0 && activeQueue[0].is_session_started) {
          setCurrentPatient(activeQueue[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to fetch queue.");
    } finally {
      setLoading(false);
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (error) {
      toast.error("Failed to access Camera/Microphone.");
      console.error(error);
    }
  };

  const setupSocket = () => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinTelemedicineRoom", roomId);
    });

    // Patient joined the room
    newSocket.on("user-connected", async (userId) => {
      if (currentPatient && isCalling) {
        toast.success("Patient connected to room. Establishing video...");
        createOffer(newSocket, userId);
      }
    });

    newSocket.on("webrtc_answer", async (data) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } catch (e) {
          console.error("Error setting remote description:", e);
        }
      }
    });

    newSocket.on("webrtc_ice_candidate", async (data) => {
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error("Error adding ice candidate:", e);
        }
      }
    });

    newSocket.on("end_telemed_call", () => {
      toast("Patient disconnected.", { icon: "⚠️" });
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setRemoteStream(null);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    });

    newSocket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  };

  const createPeerConnection = (newSocket) => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionRef.current = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit("webrtc_ice_candidate", {
          roomId,
          candidate: event.candidate
        });
      }
    };

    return pc;
  };

  const createOffer = async (newSocket, targetId) => {
    const pc = createPeerConnection(newSocket);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      newSocket.emit("webrtc_offer", {
        roomId,
        sdp: offer
      });
    } catch (e) {
      console.error("Error creating offer:", e);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainContainerRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;
    const msg = {
      id: Date.now(),
      text: chatInput,
      sender: "Dr. " + (doctorInfo?.name || "Doctor"),
      isDoctor: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("chat_message", { roomId, ...msg });
    setChatInput("");
  };

  const handleAcceptPatient = () => {
    if (queue.length === 0) return;
    const patient = queue[0];
    setCurrentPatient(patient);
    setIsCalling(true);
    
    // In a real app we might update backend status here, but for now we wait for them to join.
    toast.success(`Waiting for ${patient.patientId?.name || "Patient"} to join...`);
  };

  const handleEndCall = () => {
    if (socket) {
      socket.emit("end_telemed_call", { roomId });
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setRemoteStream(null);
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    peerConnectionRef.current = null;
    setIsCalling(false);
    toast.success("Call Ended.");

    // Next step in real app: mark this booking as Completed via API.
    // For now, we manually shift the queue locally.
    setQueue(prev => prev.slice(1));
    setCurrentPatient(null);
  };

  const handleCallNext = () => {
    if (queue.length === 0) {
      toast("Queue is empty.");
      return;
    }
    const nextPatient = queue[0]; // the one at index 0 is now the next one
    if (socket) {
      socket.emit("you_are_next", {
        patientId: nextPatient.patientId._id,
        doctorId: doctorId,
        message: "Be ready! You are next in the queue."
      });
      toast.success(`Sent 30-sec alarm to ${nextPatient.patientId?.name}`);
    }
    handleAcceptPatient();
  };

  return (
    <div ref={mainContainerRef} className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      
      {/* Sidebar Queue Panel */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-green-500" /> Session Control
          </h2>
          {doctorInfo && <p className="text-slate-400 text-sm mt-1">Dr. {doctorInfo.name}</p>}
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Patient Queue ({queue.length})</h3>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-500" /></div>
            ) : queue.length === 0 ? (
              <p className="text-slate-500 text-sm text-center">No patients waiting.</p>
            ) : (
              queue.map((patient, idx) => (
                <div key={patient._id} className={`p-4 rounded-xl border ${idx === 0 && isCalling ? 'bg-blue-900/20 border-blue-800/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 && isCalling ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{patient.patientId?.name || "Patient"}</p>
                      <p className="text-xs text-slate-400">Token #{patient.queue_token_number}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          {!isCalling ? (
             <button
              onClick={handleAcceptPatient}
              disabled={queue.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PlayCircle size={18} /> Accept Next Patient
            </button>
          ) : (
            <>
              <button
                onClick={handleEndCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2"
              >
                <PhoneOff size={18} /> End Current Call
              </button>
              {queue.length > 1 && (
                <button
                  onClick={handleCallNext}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all border border-slate-700 text-sm flex items-center justify-center gap-2"
                >
                  Skip & Call Next
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black flex flex-col">
        
        {/* Remote Video (Patient) */}
        <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
          {(!remoteStream && isCalling) ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Waiting for {currentPatient?.patientId?.name || 'patient'} to join...</p>
            </div>
          ) : (!remoteStream) ? (
             <div className="text-center text-slate-600">
              <User size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">No Active Call</p>
            </div>
          ) : null}
          
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`}
          />
        </div>

        {/* Local Video (Doctor) - Picture in Picture style */}
        <div className="absolute bottom-24 right-6 w-48 sm:w-64 aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-10">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-1 rounded text-white font-medium backdrop-blur-sm">
            You
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-8 pb-4">
          <div className="w-1/3 flex justify-start items-center">
            {/* Left aligned items if any */}
          </div>

          <div className="w-1/3 flex justify-center items-center gap-4">
            <button 
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isAudioEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-red-500 text-white'}`}
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isVideoEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-red-500 text-white'}`}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            {isCalling && (
              <button 
                onClick={handleEndCall}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg shadow-red-600/20 ml-2"
              >
                <PhoneOff size={24} />
              </button>
            )}
          </div>

          <div className="w-1/3 flex justify-end items-center gap-4">
             <button 
               onClick={() => setIsChatOpen(!isChatOpen)} 
               className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border ${isChatOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
             >
               <MessageSquare size={20} />
             </button>
             <button 
               onClick={toggleFullscreen} 
               className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg"
             >
               {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
             </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="w-80 bg-slate-900 flex flex-col shrink-0 z-30 h-full absolute right-0 top-0 bottom-0 shadow-2xl border-l border-slate-700">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
            <h3 className="text-white font-bold flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> In-Call Messages</h3>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-slate-500 text-center text-sm mt-10">No messages yet. Say hi!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isDoctor ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.sender} • {msg.time}</span>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[90%] ${msg.isDoctor ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-white border border-slate-700 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-1 top-1 bottom-1 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default TelemedicineRoom;
