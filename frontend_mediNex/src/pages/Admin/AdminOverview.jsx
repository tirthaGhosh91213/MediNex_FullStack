import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, Building2, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const AdminOverview = () => {
  // Static mock aggregates for visual demonstration
  const [stats, setStats] = useState({
    totalClinics: 12,
    totalDoctors: 45,
    platformRevenue: 154000
  });

  const revenueData = [
    { name: "City Care", revenue: 45000 },
    { name: "LifeLine", revenue: 38000 },
    { name: "Apollo X", revenue: 29000 },
    { name: "General Med", revenue: 21000 },
    { name: "Others", revenue: 21000 },
  ];

  const doctorData = [
    { name: "Verified", value: 38 },
    { name: "Pending", value: 7 },
  ];
  const COLORS = ["#10b981", "#f59e0b"]; // Emerald & Amber

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Number Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Clinic Stat */}
         <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
             <Building2 size={28} />
           </div>
           <div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Registered Clinics</p>
             <h3 className="text-3xl font-black text-slate-800">{stats.totalClinics}</h3>
           </div>
         </motion.div>

         {/* Doctor Stat */}
         <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
             <UserCircle2 size={28} />
           </div>
           <div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Doctors Network</p>
             <h3 className="text-3xl font-black text-slate-800">{stats.totalDoctors}</h3>
           </div>
         </motion.div>

         {/* Revenue Stat */}
         <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 relative overflow-hidden">
           <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 relative z-10">
             <Activity size={28} />
           </div>
           <div className="relative z-10">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</p>
             <h3 className="text-3xl font-black text-slate-800 text-emerald-700">₹{(stats.platformRevenue/1000).toFixed(1)}k</h3>
           </div>
           <div className="absolute -right-4 -top-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>
         </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Bar Chart */}
         <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Top Clinics</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                   <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={50} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Pie Chart */}
         <motion.div initial={{scale: 0.95, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{delay: 0.1}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Doctor Verification Status</h3>
            <div className="flex-1 min-h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={doctorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {doctorData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
               {/* Center Text */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center mt-[-30px]">
                   <span className="block text-2xl font-black text-slate-800">{(doctorData[0].value / (doctorData[0].value + doctorData[1].value) * 100).toFixed(0)}%</span>
                   <span className="block text-xs font-bold text-slate-400">Verified</span>
                 </div>
               </div>
            </div>
         </motion.div>

      </div>
    </div>
  );
};

export default AdminOverview;
