import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Bot, HeartPulse, Camera, Stethoscope, 
  Send, Loader2, Info, Search, FileImage, ShieldCheck, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AIAssistant = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("symptoms"); // symptoms | prescription

  // Symptom Checker State
  const [symptomInput, setSymptomInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [symptomResult, setSymptomResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.address) {
            const { city, state_district, state, suburb, village, town } = res.data.address;
            const locationString = city || town || suburb || village || state_district || state || "Your Location";
            setLocationInput(locationString);
            toast.success("Location updated successfully!");
          } else {
            setLocationInput(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        } catch (error) {
          toast.error("Failed to fetch address");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  // Prescription Analyzer State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prescriptionResult, setPrescriptionResult] = useState(null);

  const backendUrl = "http://localhost:4000";

  // Handle Symptom Checker
  const handleCheckSymptoms = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setIsChecking(true);
    setSymptomResult(null);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/patient/ai/symptom-checker`,
        { 
          symptoms: symptomInput,
          location: locationInput,
          budget: budgetInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setSymptomResult(data.result);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to analyze symptoms");
    } finally {
      setIsChecking(false);
    }
  };

  // Handle Prescription Analyzer
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setPrescriptionResult(null);
    }
  };

  const handleAnalyzePrescription = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("prescription", selectedFile);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/patient/ai/analyze-prescription`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );

      if (data.success) {
        toast.success("Prescription Analyzed! Alarms have been set automatically.");
        setPrescriptionResult(data.alarms);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to analyze prescription");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearPrescription = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setPrescriptionResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.03] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
            <Bot size={14} /> Powered by Google Gemini AI
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">MediConnect AI Assistant</h2>
          <p className="text-slate-500 font-medium text-sm mt-2 max-w-lg">
            Describe your symptoms in English or Bengali, or upload a prescription to automatically set medication alarms.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("symptoms")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "symptoms" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Stethoscope size={18} /> Symptom Checker
        </button>
        <button 
          onClick={() => setActiveTab("prescription")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "prescription" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Camera size={18} /> Prescription Analyzer
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* SYMPTOM CHECKER TAB */}
        {activeTab === "symptoms" && (
          <motion.div 
            key="symptoms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Input Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-2">How are you feeling?</h3>
              <p className="text-sm text-slate-500 mb-6">Type your symptoms in English, Bengali, or Banglish.</p>
              
              <form onSubmit={handleCheckSymptoms} className="flex flex-col flex-1">
                <textarea 
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., I have a severe headache and slight fever since morning... OR Amar matha betha korche..."
                  className="w-full flex-1 min-h-[200px] p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium text-slate-700"
                ></textarea>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Your Location (Optional)</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="e.g., Kolkata, Salt Lake..."
                        className="w-full p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-slate-700"
                      />
                      <button 
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        title="Use Current Location"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Your Budget (Optional)</label>
                    <input 
                      type="text"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="e.g., Under ₹500, ₹1000..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isChecking || !symptomInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {isChecking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {isChecking ? "Analyzing..." : "Analyze Symptoms"}
                  </button>
                </div>
              </form>
            </div>

            {/* Result Section */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col justify-center relative overflow-hidden">
              {isChecking && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                    <div className="w-16 h-16 relative mb-4">
                       <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-indigo-600 font-bold animate-pulse">AI is thinking...</p>
                 </div>
              )}

              {!symptomResult && !isChecking ? (
                 <div className="text-center opacity-50">
                    <Bot size={64} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-500">Awaiting Input</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Submit your symptoms to get instant AI-powered medical advice.</p>
                 </div>
              ) : symptomResult && !isChecking ? (
                 <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative">
                       <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                          <Info size={16} />
                       </div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">AI Advice</h4>
                       <p className="text-slate-700 font-medium leading-relaxed">{symptomResult.advice}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-600/20 text-center">
                       <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2">Recommended Specialist</p>
                       <h2 className="text-3xl font-black mb-8">{symptomResult.recommended_specialization}</h2>
                       <button 
                         onClick={() => navigate(`/patient/dashboard?specialization=${encodeURIComponent(symptomResult.recommended_specialization)}`)}
                         className="w-full bg-white text-indigo-700 hover:bg-indigo-50 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-colors"
                       >
                         <Search size={18} /> Find {symptomResult.recommended_specialization}s
                       </button>
                    </div>
                 </div>
              ) : null}
            </div>
          </motion.div>
        )}

        {/* PRESCRIPTION ANALYZER TAB */}
        {activeTab === "prescription" && (
          <motion.div 
            key="prescription"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Upload Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Prescription Reader</h3>
              <p className="text-sm text-slate-500 mb-6">Upload a photo of your prescription. AI will extract your medicines and automatically set your daily alarms.</p>
              
              {!filePreview ? (
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-2xl h-64 flex flex-col items-center justify-center relative transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-4">
                    <FileImage size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700">Click to upload prescription</h4>
                  <p className="text-xs font-medium text-slate-400 mt-1">JPG, PNG supported</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative h-64 rounded-2xl overflow-hidden border-2 border-indigo-100 group">
                    <img src={filePreview} alt="Prescription Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={clearPrescription} className="bg-white text-red-500 px-4 py-2 rounded-lg font-bold text-sm">Remove File</button>
                    </div>
                  </div>
                  <button 
                    onClick={handleAnalyzePrescription}
                    disabled={isAnalyzing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    {isAnalyzing ? "Extracting Data..." : "Analyze & Set Alarms"}
                  </button>
                </div>
              )}
            </div>

            {/* Result Section */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col justify-center relative overflow-hidden">
              {isAnalyzing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
                    <div className="w-16 h-16 relative mb-4">
                       <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-indigo-600 font-bold animate-pulse">Reading handwritten text...</p>
                 </div>
              )}

              {!prescriptionResult && !isAnalyzing ? (
                 <div className="text-center opacity-50">
                    <HeartPulse size={64} className="mx-auto text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-500">Waiting for Image</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Upload your prescription to extract medication schedules.</p>
                 </div>
              ) : prescriptionResult && !isAnalyzing ? (
                 <div className="h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-emerald-800">Alarms Configured</h4>
                        <p className="text-xs font-medium text-emerald-600">The following alarms will ring daily for the duration specified.</p>
                      </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                      {prescriptionResult.map((med, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                           <div className="flex justify-between items-start mb-4">
                              <h4 className="font-black text-slate-800 text-lg">{med.medicineName}</h4>
                              <span className="bg-blue-50 text-blue-600 font-bold text-xs px-3 py-1 rounded-full">{med.durationDays} Days</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {med.times.map((time, tIdx) => (
                               <span key={tIdx} className="bg-slate-100 text-slate-600 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-200">
                                 {time}
                               </span>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
