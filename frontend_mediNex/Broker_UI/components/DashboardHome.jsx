import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar, User } from 'lucide-react';

// --- Animated SVG Components ---
const AnimatedCircleChart = ({ percentage, color }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
        <motion.circle
          cx="50%" cy="50%" r={radius} stroke={color} strokeWidth="12" fill="transparent"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
      </div>
    </div>
  );
};

const AnimatedLineChart = () => (
  <div className="w-full h-48 mt-4 relative border-b border-l border-slate-200">
    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
      <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
      <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
      <motion.path
        d="M 0,130 C 100,100 150,140 250,80 C 350,20 400,60 500,10"
        fill="transparent" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.circle cx="250" cy="80" r="5" fill="#2563eb" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.circle cx="500" cy="10" r="5" fill="#2563eb" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
    </svg>
  </div>
);

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Platform Analytics Overview</h2>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Patient Recovery Rate</h3>
              <p className="text-sm text-slate-500">Based on last 30 days</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={20} /></div>
          </div>
          <AnimatedCircleChart percentage={84} color="#10b981" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-full flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Appointment Trends</h3>
              <p className="text-sm text-slate-500">Weekly patient inflow</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <AnimatedLineChart />
        </div>
      </div>

      {/* Summaries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" /> Recent Appointments
          </h3>
          <div className="space-y-4">
            {['Michael Scott', 'Jim Halpert', 'Pam Beesly'].map((name, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="text-sm text-slate-500">Today, 10:00 AM</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">Upcoming</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" /> Our Doctors
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Dr. Richard James', spec: 'General Physician' },
              { name: 'Dr. Emily Larson', spec: 'Gynecologist' }
            ].map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {doc.name.charAt(4)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-sm text-slate-500">{doc.spec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;