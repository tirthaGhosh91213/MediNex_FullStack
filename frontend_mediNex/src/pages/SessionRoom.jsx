import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { Loader2, ArrowLeft, ShieldCheck, Video, Mic, MicOff, VideoOff, PhoneOff, User, MessageSquare, Maximize, Minimize, Send, X, CameraOff } from "lucide-react";
import { toast } from "react-hot-toast";

const SessionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // WebRTC & Media States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const localStreamRef = useRef(null);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(null);
  const mainContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Chat & Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const isChatOpenRef = useRef(false);

  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  useEffect(() => {
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

  useEffect(() => {
    if (!loading && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [loading, localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setLoading(false);
    } catch (error) {
      toast.error("Camera/Microphone access denied. You will join without video/audio.");
      console.error(error);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setLoading(false);
    } finally {
      setupSocket();
    }
  };

  const setupSocket = () => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinTelemedicineRoom", roomId);
      newSocket.emit("patient_ready", { roomId });
    });

    newSocket.on("doctor_ready", () => {
      newSocket.emit("patient_ready", { roomId });
    });

    newSocket.on("webrtc_offer", async (data) => {
      const pc = createPeerConnection(newSocket);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit("webrtc_answer", {
          roomId,
          sdp: answer
        });
      } catch (e) {
        console.error("Error handling offer:", e);
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
      toast("The doctor has ended the call.", { icon: "👋" });
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setRemoteStream(null);
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setTimeout(() => navigate("/patient/my-bookings"), 2000);
    });

    newSocket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Show red dot if message is from doctor and chat is closed
      if (msg.isDoctor && !isChatOpenRef.current) {
        setHasUnreadMessages(true);
      }
    });
  };

  const createPeerConnection = (newSocket) => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();

    const pc = new RTCPeerConnection(pcConfig);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        setIsConnected(false);
      }
    };

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
      sender: user?.name || "Patient",
      isDoctor: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit("chat_message", { roomId, ...msg });
    setChatInput("");
  };

  const handleEndCall = () => {
    if (socket) {
      socket.emit("end_telemed_call", { roomId });
    }
    navigate("/patient/my-bookings");
  };

  return (
    <div ref={mainContainerRef} className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Navigation Bar */}
      {!isFullscreen && (
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleEndCall}
            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              MediNex Secure Consultation <ShieldCheck size={18} className="text-green-500" />
            </h1>
            <p className="text-slate-400 text-xs font-medium">End-to-End Encrypted Peer-to-Peer Connection</p>
          </div>
        </div>
      </div>
      )}

      {/* Main Container for Video and Chat */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-white font-bold tracking-widest text-sm uppercase">Setting up Media...</p>
          </div>
        ) : (
          <>
            {/* Remote Video (Doctor) */}
            <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden min-h-0">
              {(!remoteStream && !isConnected) ? (
                <div className="text-center text-slate-600">
                  <User size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">Waiting for Doctor to join...</p>
                  <p className="text-sm mt-2">The doctor will initiate the video call when ready.</p>
                </div>
              ) : (!remoteStream && isConnected) ? (
                <div className="text-center text-slate-600">
                  <User size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">Doctor connected (No Camera/Audio)</p>
                </div>
              ) : null}
              
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`}
              />
            </div>

            {/* Local Video (Patient) - Picture in Picture style */}
            <div className="absolute bottom-24 right-6 w-32 sm:w-48 aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-10">
              {!localStream ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-700">
                  <CameraOff size={24} className="text-slate-500 mb-1" />
                  <span className="text-[10px] text-slate-400 text-center px-2">Camera Off</span>
                </div>
              ) : (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              )}
              <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-1 rounded text-white font-medium backdrop-blur-sm">
                You
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between px-8 pb-4 z-20">
              <div className="w-1/3 flex justify-start items-center"></div>

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

                <button 
                  onClick={handleEndCall}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg shadow-red-600/20 ml-2"
                >
                  <PhoneOff size={24} />
                </button>
              </div>

              <div className="w-1/3 flex justify-end items-center gap-4">
                <button 
                  onClick={() => {
                    const newVal = !isChatOpen;
                    setIsChatOpen(newVal);
                    isChatOpenRef.current = newVal;
                    if (newVal) setHasUnreadMessages(false);
                  }} 
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border ${isChatOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
                >
                  <MessageSquare size={20} />
                  {hasUnreadMessages && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </button>
                <button 
                  onClick={toggleFullscreen} 
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </>

        )}
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="w-80 bg-slate-900 flex flex-col shrink-0 z-30 h-full border-l border-slate-700 relative">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
            <h3 className="text-white font-bold flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> In-Call Messages</h3>
            <button onClick={() => { setIsChatOpen(false); isChatOpenRef.current = false; }} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-slate-500 text-center text-sm mt-10">No messages yet. Say hi!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${!msg.isDoctor ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.sender} • {msg.time}</span>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[90%] ${!msg.isDoctor ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-white border border-slate-700 rounded-bl-none'}`}>
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
    </div>
  );
};

export default SessionRoom;
