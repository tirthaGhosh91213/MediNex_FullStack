import React from "react";
import { Users, CalendarClock, Activity, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const BrokerOverview = () => {
  // Mock data for the static overview initially
  const stats = [
    { 
      label: "Today's Patients", 
      value: "42", 
      trend: "+12% from yesterday", 
      icon: <Users size={24} className="text-blue-600" />,
      color: "bg-blue-50 border-blue-100" 
    },
    { 
      label: "Pending Approvals", 
      value: "5", 
      trend: "Requires attention", 
      icon: <CalendarClock size={24} className="text-amber-600" />,
      color: "bg-amber-50 border-amber-100",
      badge: true
    },
    { 
      label: "Active Consultations", 
      value: "3", 
      trend: "In-Progress right now", 
      icon: <Activity size={24} className="text-purple-600" />,
      color: "bg-purple-50 border-purple-100",
      pulse: true
    },
    { 
      label: "Today's Revenue", 
      value: "₹24,500", 
      trend: "+5% from yesterday", 
      icon: <IndianRupee size={24} className="text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100" 
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Morning, Clinic Manager! ☀️</h2>
          <p className="text-blue-100 max-w-lg text-lg">Your doctors are actively consulting. You have 5 pending offline booking requests to address before noon.</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-40 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute right-40 -bottom-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl mix-blend-overlay"></div>
      </div>

      {/* Stats Header Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className={`p-6 rounded-3xl border shadow-sm flex flex-col h-full bg-white relative overflow-hidden group hover:shadow-lg transition-all duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`}>
                     {stat.icon}
                  </div>
                  {stat.badge && (
                     <span className="flex h-3 w-3 relative">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                     </span>
                  )}
                </div>
                
                <div>
                   <h3 className="text-slate-500 font-semibold mb-1">{stat.label}</h3>
                   <div className="flex items-baseline gap-2">
                     <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
                   </div>
                   <p className="text-sm font-medium text-slate-400 mt-2">{stat.trend}</p>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
    </div>
  );
};

export default BrokerOverview;
