import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Settings,
  LogOut,
  Camera,
  Calendar,
  MapPin,
  Edit3,
} from "lucide-react";

const AdminProfile = () => {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const adminProfile = {
    name: "Dr. Admin Singh",
    email: "admin@medicadmin.com",
    phone: "+91 98765 43210",
    role: "Super Admin",
    joined: "Jan 2025",
    location: "Kolkata, West Bengal",
    avatar: "https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&size=128&bold=true",
  };

  const stats = [
    { label: "Total Doctors", value: "24", change: "+3" },
    { label: "Active Appointments", value: "156", change: "+12" },
    { label: "Pending Requests", value: "3", change: "0" },
    { label: "Total Patients", value: "1,247", change: "+45" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Admin Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account settings, credentials, and platform statistics.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          <Edit3 size={16} />
          {editing ? "Cancel" : "Edit Profile"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Header */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg overflow-hidden border-4 border-white">
                  <img 
                    src={adminProfile.avatar} 
                    alt="Admin" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {editing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    <Camera size={16} />
                  </motion.button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {adminProfile.name}
                  </h3>
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full">
                    <Shield size={14} />
                    {adminProfile.role}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    <span>{adminProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    <span>{adminProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{adminProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Joined {adminProfile.joined}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900 mb-6">Platform Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition"
                >
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">
                    {stat.label}
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${
                    stat.change.startsWith('+') 
                      ? 'text-emerald-600' 
                      : 'text-slate-500'
                  }`}>
                    {stat.change} this week
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar - Settings */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Password Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Key size={20} />
                Change Password
              </h4>
              {editing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Update Password
                </motion.button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      {showPassword ? (
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      ) : (
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0013.485 11a8.975 8.975 0 01-2.485-.5V10.5a3.5 3.5 0 00-3-3.475V5.111c0-.917-.146-1.805-.417-2.658A8.224 8.224 0 0110 2c.663 0 1.311.055 1.951.148.685.177 1.348.46 1.942.872l1.707-1.707zM2 10c0 1.846.224 3.638.637 5.332l1.018-1.018a4.5 4.5 0 01-.582-1.314V10.5a2.5 2.5 0 012.5-2.5h2.879c-.435.46-.873 1.037-1.229 1.698L5.24 10.5a1 1 0 101.986 0l.041-.024A3.48 3.48 0 007.346 10H10a1 1 0 100-2h-2.879a6.957 6.957 0 011.723-1.665L11.24 5.5a1 1 0 10-1.986 0l-.041.024c-.293.173-.585.355-.873.535A6.46 6.46 0 005 5a6 6 0 00-2.085 11.456l1.458-1.458a4.006 4.006 0 01.486-5.61l-.253-.253A5.1 5.1 0 002 10z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Quick Actions
            </h4>
            <div className="space-y-2">
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center gap-3 p-3 text-left text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-xl transition"
              >
                <Shield size={16} className="text-blue-600" />
                Manage Permissions
              </motion.button>
              <motion.button
                whileHover={{ x: 4 }}
                className="w-full flex items-center gap-3 p-3 text-left text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-xl transition"
              >
                <LogOut size={16} className="text-red-600" />
                Sign Out
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfile;