import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Trash2,
  Search,
  Stethoscope,
  User,
  MessageSquare,
} from "lucide-react";

const AllAppointments = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [search, setSearch] = useState("");

  const MOCK_APPOINTMENTS = [
    {
      id: 1,
      patientName: "Michael Scott",
      patientId: "PAT‑1029",
      doctorName: "Dr. Richard James",
      specialty: "General Physician",
      date: "2026‑04‑08",
      time: "10:00 AM",
      type: "Follow‑up Consultation",
      status: "upcoming",
      priority: "high",
    },
    {
      id: 2,
      patientName: "Jim Halpert",
      patientId: "PAT‑1030",
      doctorName: "Dr. Emily Larson",
      specialty: "Gynecologist",
      date: "2026‑04‑08",
      time: "11:30 AM",
      type: "Pre‑Natal Checkup",
      status: "upcoming",
      priority: "regular",
    },
    {
      id: 3,
      patientName: "Pam Beesly",
      patientId: "PAT‑1031",
      doctorName: "Dr. Priya Sharma",
      specialty: "Cardiologist",
      date: "2026‑04‑07",
      time: "03:00 PM",
      type: "ECG + Review",
      status: "completed",
      notes: "Stable, advised follow‑up in 3 months.",
    },
    {
      id: 4,
      patientName: "Dwight Schrute",
      patientId: "PAT‑1032",
      doctorName: "Dr. Rohan Gupta",
      specialty: "Neurologist",
      date: "2026‑04‑06",
      time: "09:00 AM",
      type: "Follow‑up",
      status: "cancelled",
      reason: "Patient no‑show",
    },
  ];

  const getStatusBadge = (status, priority = "regular") => {
    switch (status) {
      case "upcoming":
        const color =
          priority === "high"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-blue-50 text-blue-700 border-blue-200";
        return (
          <span className={`text-xs px-3 py-1.5 border rounded-full font-medium ${color} flex items-center gap-1`}>
            {priority === "high" && (
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse"></span>
            )}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case "completed":
        return (
          <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium flex items-center gap-1">
            <CheckCircle2 size={14} /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium flex items-center gap-1">
            <XCircle size={14} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const filtered = MOCK_APPOINTMENTS.filter(
    (a) =>
      (a.status === activeTab ||
        (activeTab === "upcoming" && a.status === "upcoming")) &&
      (search === "" ||
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.patientId.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-sm text-slate-500 max-w-md">
            Admin overview of all upcoming, completed, and cancelled appointments.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, doctor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-1">
        {[
          { key: "upcoming", label: "Upcoming", count: MOCK_APPOINTMENTS.filter((a) => a.status === "upcoming").length },
          { key: "completed", label: "Completed", count: MOCK_APPOINTMENTS.filter((a) => a.status === "completed").length },
          { key: "cancelled", label: "Cancelled", count: MOCK_APPOINTMENTS.filter((a) => a.status === "cancelled").length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 rounded-t transition ${
              activeTab === key
                ? "text-blue-700 border-blue-500 bg-slate-50"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            <span>{label}</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments list - NO BACKGROUND, just individual cards with gaps */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 space-y-3">
                  {/* Patient line */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-slate-900">
                      {app.patientName}
                    </span>
                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {app.patientId}
                    </span>

                    {/* Status badge (inline) */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        app.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Doctor + Type */}
                  <div className="text-sm text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl">
                      <Stethoscope size={14} /> {app.doctorName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{app.specialty}</span>
                    <span>•</span>
                    <span className="text-slate-500">{app.type}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(app.date).toLocaleDateString("en‑IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={16} className="text-slate-400" />
                      {app.time}
                    </span>
                  </div>

                  {/* Notes or reason */}
                  {app.notes && (
                    <div className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <MessageSquare size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{app.notes}</span>
                    </div>
                  )}

                  {app.reason && (
                    <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">
                        Reason: {app.reason}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 self-start lg:self-center min-w-max">
                  {/* Main status badge */}
                  <div>{getStatusBadge(app.status, app.priority)}</div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                    >
                      <Eye size={14} /> View
                    </motion.button>

                    {app.status === "upcoming" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl shadow-sm hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <RefreshCw size={14} /> Reschedule
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl shadow-sm hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200"
                        >
                          <Trash2 size={14} /> Cancel
                        </motion.button>
                      </>
                    )}

                    {app.status === "cancelled" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                      >
                        <RefreshCw size={14} /> Reactivate
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-lg font-medium mb-2">No appointments found</p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointments;