import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const RegisterPage = () => {
  const [role, setRole] = useState("Patient");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    // Extra fields for Broker
    clinic_name: "",
    trade_license_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = role === "Patient" 
        ? "http://localhost:4000/api/patient/register" 
        : "http://localhost:4000/api/broker/register";
      
      const payload = { ...formData };
      
      const { data } = await axios.post(endpoint, payload);
      
      if (data.success) {
        toast.success(data.message || "Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
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
