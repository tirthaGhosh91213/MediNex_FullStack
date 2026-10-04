import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // View states: "LOGIN" | "FORGOT_EMAIL" | "FORGOT_OTP" | "FORGOT_NEW_PASS"
  const [viewState, setViewState] = useState("LOGIN");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // AuthContext login now iterates through roles automatically
    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === "Patient") navigate("/patient/dashboard");
      else if (result.role === "Broker") navigate("/broker/dashboard");
      else if (result.role === "Admin") navigate("/admin/dashboard");
    }
    
    setIsLoading(false);
  };


  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setIsLoading(true);
    try {
      const { data } = await axios.post("/auth/send-otp", { email });
      if (data.success) {
        toast.success("OTP sent to your email!");
        setViewState("FORGOT_OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    if (otp.length < 4) return toast.error("Invalid OTP");
    setIsLoading(true);
    try {
      const { data } = await axios.post("/auth/verify-otp", { email, otp });
      if (data.success) {
        toast.success("OTP verified!");
        setViewState("FORGOT_NEW_PASS");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setIsLoading(true);
    try {
      const { data } = await axios.post("/auth/reset-password", { email, otp, newPassword });
      if (data.success) {
        toast.success("Password reset successfully! Please log in.");
        setViewState("LOGIN");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
    setIsLoading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background ambient liquid effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-white/5 blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={viewState}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md relative z-10"
        >
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-3xl p-8 overflow-hidden relative">
            {/* Top glowing accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-white/80" />

            {/* Login View */}
            {viewState === "LOGIN" && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
                  <p className="text-blue-200/60 text-sm">Sign in to continue to MediNex</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setViewState("FORGOT_EMAIL")}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </button>
                </form>

                <div className="text-center text-sm text-white/40 pt-4 border-t border-white/10">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Create one now
                  </Link>
                </div>
              </div>
            )}

            {/* Forgot Password - Step 1: Email */}
            {viewState === "FORGOT_EMAIL" && (
              <div className="space-y-8">
                <button 
                  onClick={() => setViewState("LOGIN")}
                  className="flex items-center text-xs text-white/40 hover:text-white transition-colors gap-1 mb-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to login
                </button>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
                  <p className="text-blue-200/60 text-sm">Enter your email to receive an OTP</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="your registered email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Forgot Password - Step 2: OTP */}
            {viewState === "FORGOT_OTP" && (
              <div className="space-y-8">
                <button 
                  onClick={() => setViewState("FORGOT_EMAIL")}
                  className="flex items-center text-xs text-white/40 hover:text-white transition-colors gap-1 mb-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Enter OTP</h2>
                  <p className="text-blue-200/60 text-sm">We've sent a code to <span className="text-blue-300">{email}</span></p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-1">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-center tracking-[0.5em] font-mono text-lg rounded-xl py-3 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20 placeholder:tracking-normal"
                        placeholder="Enter 4-6 digit OTP"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all flex justify-center items-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Forgot Password - Step 3: New Password */}
            {viewState === "FORGOT_NEW_PASS" && (
              <div className="space-y-8">
                <div className="text-center space-y-2 pt-4">
                  <h2 className="text-2xl font-bold tracking-tight text-white">New Password</h2>
                  <p className="text-blue-200/60 text-sm">Create a strong new password</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Set New Password"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
