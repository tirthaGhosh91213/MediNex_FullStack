import React, { useState, useEffect, useCallback } from "react";
import { Users, IndianRupee, TrendingUp, BarChart3, Calendar, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHART_COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626", "#6366f1"];

const ClinicPerformance = () => {
  const { token } = useAuth();
  const backendUrl = "http://localhost:4000";

  const [analyticsTab, setAnalyticsTab] = useState("today");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabLabel = { today: "Today", week: "This Week", month: "This Month" };

  const fetchAnalytics = useCallback(async (tf) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/broker/analytics?timeframe=${tf}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setAnalytics(data);
    } catch (e) { console.error("Analytics fetch error", e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchAnalytics(analyticsTab); }, [analyticsTab, token, fetchAnalytics]);

  const chartData = analytics?.doctorStats?.map(ds => ({
    name: ds.doctor.name.split(" ").slice(0, 2).join(" "),
    revenue: ds.revenue,
    patients: ds.patientsSeen
  })) || [];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <TrendingUp size={24} />
            </div>
            Clinic Performance & Revenue
          </h2>
          <p className="text-slate-400 font-medium mt-2 ml-[60px]">Track your clinic's financial health and doctor activity.</p>
        </div>
        <div className="flex bg-gray-100 rounded-2xl p-1.5 gap-1">
          {["today", "week", "month"].map(tf => (
            <button key={tf} onClick={() => setAnalyticsTab(tf)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${analyticsTab === tf ? "bg-white text-slate-800 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
              {tf === "today" && <Calendar size={14} />}
              {tf === "week" && <BarChart3 size={14} />}
              {tf === "month" && <TrendingUp size={14} />}
              {tabLabel[tf]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-emerald-600 rounded-full"></div></div>
      ) : !analytics || analytics.doctorStats?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center">
          <BarChart3 size={56} className="mx-auto text-gray-300 mb-5" />
          <p className="text-gray-500 font-medium text-xl">No completed consultations for {tabLabel[analyticsTab].toLowerCase()}.</p>
          <p className="text-gray-400 text-sm mt-2">Revenue data will appear here once patients are marked as completed.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-7 text-white shadow-xl shadow-emerald-600/20 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><IndianRupee size={24} /></div>
                  <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest">{tabLabel[analyticsTab]} Revenue</p>
                </div>
                <h2 className="text-4xl font-black">₹{analytics.totalRevenue.toLocaleString("en-IN")}</h2>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-7 text-white shadow-xl shadow-blue-600/20 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                  <p className="text-blue-100 font-bold text-sm uppercase tracking-widest">Patients Completed</p>
                </div>
                <h2 className="text-4xl font-black">{analytics.totalPatients}</h2>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-7 text-white shadow-xl shadow-purple-600/20 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Stethoscope size={24} /></div>
                  <p className="text-purple-100 font-bold text-sm uppercase tracking-widest">Active Doctors</p>
                </div>
                <h2 className="text-4xl font-black">{analytics.doctorStats.length}</h2>
              </div>
            </motion.div>
          </motion.div>

          {/* Chart + Doctor List */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Doctor Wise List */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={18} className="text-indigo-600" /> Doctor-wise Breakdown</h4>
              </div>
              <div className="divide-y divide-gray-50 max-h-[450px] overflow-y-auto custom-scrollbar flex-1">
                {analytics.doctorStats.map((ds, idx) => (
                  <div key={ds.doctor._id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}>
                      {idx + 1}
                    </div>
                    <img src={ds.doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ds.doctor.name)}`} className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 truncate">{ds.doctor.name}</h5>
                      <p className="text-xs text-slate-400 font-semibold">{ds.doctor.specialization}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-800">₹{ds.revenue.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{ds.patientsSeen} patients</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
              <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><IndianRupee size={18} className="text-emerald-600" /> Revenue by Doctor ({tabLabel[analyticsTab]})</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} angle={-20} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                    <Tooltip formatter={(value, name) => [name === "revenue" ? `₹${value.toLocaleString("en-IN")}` : value, name === "revenue" ? "Revenue" : "Patients"]} contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", fontWeight: 700, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="revenue" radius={[12, 12, 0, 0]}>
                      {chartData.map((_, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClinicPerformance;
