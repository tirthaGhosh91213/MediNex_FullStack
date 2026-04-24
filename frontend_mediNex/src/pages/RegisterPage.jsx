import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import { CheckCircle2, Building, MapPin, Loader2, Navigation, ImagePlus, X } from "lucide-react";

const RegisterPage = () => {
  const [role, setRole] = useState("Patient");
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    // Extra fields for Broker
    clinic_name: "",
    trade_license_number: "",
    clinic_address: "",
  });
  const [files, setFiles] = useState({ aadhar: null, license: null });
  const [previews, setPreviews] = useState({ aadhar: null, license: null });
  const [location, setLocation] = useState(null); // { lat, lng }
  const [locationLabel, setLocationLabel] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        // Reverse geocode using free API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await res.json();
          const address = geoData.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setLocationLabel(address);
          setFormData(prev => ({ ...prev, clinic_address: address }));
        } catch {
          setLocationLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setLocationLoading(false);
      },
      () => {
        toast.error("Unable to get your location. Please allow location access.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [name]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews(prev => ({ ...prev, [name]: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeFile = (name) => {
    setFiles(prev => ({ ...prev, [name]: null }));
    setPreviews(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = role === "Patient" 
        ? "http://localhost:4000/api/patient/register" 
        : "http://localhost:4000/api/broker/register";
      
      let payload = formData;
      let headers = { "Content-Type": "application/json" };

      if (role === "Broker") {
        payload = new FormData();
        Object.keys(formData).forEach((key) => {
          payload.append(key, formData[key]);
        });
        // Append GPS coordinates as JSON
        if (location) {
          payload.append(
            "clinic_location",
            JSON.stringify({ type: "Point", coordinates: [location.lng, location.lat] })
          );
        }
        if (files.aadhar) payload.append("aadhar", files.aadhar);
        if (files.license) payload.append("license", files.license);
        headers = { "Content-Type": "multipart/form-data" };
      }
      
      const { data } = await axios.post(endpoint, payload, { headers });
      
      if (data.success) {
        if (role === "Broker") {
          setIsSuccess(true);
        } else {
          toast.success(data.message || "Registration successful! Please login.");
          navigate("/login");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 text-center p-12">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="text-blue-600" size={40} />
            <div className="absolute ml-12 mt-12 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <CheckCircle2 className="text-white" size={16} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Registration Submitted</h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Your clinic registration request has been submitted successfully. Please allow up to <span className="font-bold text-blue-600">24 working hours</span> for administrative review and approval.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 px-8 py-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-blue-100 font-medium">Join MediConnect AI</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">I am registering as a:</label>
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer border px-4 py-3 rounded-lg flex-1 hover:border-blue-500 transition-colors">
                     <input type="radio" name="role" checked={role === "Patient"} onChange={() => setRole("Patient")} className="w-4 h-4 text-blue-600" />
                     <span className="font-semibold text-slate-800">Patient</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer border px-4 py-3 rounded-lg flex-1 hover:border-blue-500 transition-colors">
                     <input type="radio" name="role" checked={role === "Broker"} onChange={() => setRole("Broker")} className="w-4 h-4 text-blue-600" />
                     <span className="font-semibold text-slate-800">Clinic/Broker</span>
                  </label>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            {role === "Broker" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
                    <input
                      type="text"
                      name="clinic_name"
                      required={role==="Broker"}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                      placeholder="MediCare Clinic"
                      value={formData.clinic_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trade License Number</label>
                    <input
                      type="text"
                      name="trade_license_number"
                      required={role==="Broker"}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                      placeholder="TL-123456"
                      value={formData.trade_license_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Full Address</label>
                    <textarea
                      name="clinic_address"
                      required={role==="Broker"}
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800 resize-none"
                      placeholder="123 Health Avenue, Sector 4, City..."
                      value={formData.clinic_address}
                      onChange={handleChange}
                    ></textarea>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <><Loader2 size={15} className="animate-spin" /> Detecting location...</>
                      ) : location ? (
                        <><Navigation size={15} className="text-emerald-500" /> <span className="text-emerald-600">Location detected ✓</span></>
                      ) : (
                        <><MapPin size={15} /> Use Current Location</>  
                      )}
                    </button>
                  </div>
                  {/* Aadhar Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner's Aadhar Card (Image)</label>
                    {previews.aadhar ? (
                      <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={previews.aadhar} alt="Aadhar" className="w-full h-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile("aadhar")}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                        <ImagePlus size={24} className="text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Click to upload image</span>
                        <input type="file" name="aadhar" accept="image/jpeg,image/png,image/webp" required={role==="Broker"} className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>

                  {/* Clinic License Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clinic License (Image)</label>
                    {previews.license ? (
                      <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={previews.license} alt="License" className="w-full h-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile("license")}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                        <ImagePlus size={24} className="text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Click to upload image</span>
                        <input type="file" name="license" accept="image/jpeg,image/png,image/webp" required={role==="Broker"} className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-800"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
