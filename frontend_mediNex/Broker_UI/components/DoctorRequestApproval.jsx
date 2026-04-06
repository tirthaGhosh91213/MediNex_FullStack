import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  GraduationCap,
  BadgeCheck,
  Clock,
} from "lucide-react";

const DoctorRequestApproval = () => {
  // Move this state here; no useEffect needed for first render
  const [requests, setRequests] = useState([
    {
      id: 101,
      name: "Dr. Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 88776 65432",
      specialty: "Cardiologist",
      experience: 14,
      degree: "MBBS, MD (Cardiology)",
      registrationNumber: "WB/24589",
      clinicName: "City Heart Clinic",
      clinicAddress: "23, Park Street, Kolkata",
      bio: "Expert in interventional cardiology with 14+ years of clinical practice. Special interest in coronary angiography and pacemaker implantation.",
      submittedAt: "2026‑04‑06",
      status: "pending",
    },
    {
      id: 102,
      name: "Dr. Arjun Mehta",
      email: "arjun.mehta@example.com",
      phone: "+91 98765 43210",
      specialty: "Orthopedic Surgeon",
      experience: 17,
      degree: "MBBS, MS (Orthopedics)",
      registrationNumber: "WB/31472",
      clinicName: "Metro Ortho Centre",
      clinicAddress: "78, Ballygunge Circular Road, Kolkata",
      bio: "Experienced in joint replacement surgery and sports‑related injuries. Performs around 150 surgeries per year.",
      submittedAt: "2026‑04‑05",
      status: "pending",
    },
    {
      id: 103,
      name: "Dr. Ananya Roy",
      email: "ananya.roy@example.com",
      phone: "+91 87654 32109",
      specialty: "Dermatologist",
      experience: 11,
      degree: "MBBS, MD (Dermatology)",
      registrationNumber: "WB/19876",
      clinicName: "Skin & Laser Clinic",
      clinicAddress: "45, Lake Gardens, Kolkata",
      bio: "Cosmetic and medical dermatology specialist with strong focus on acne, vitiligo, and skin‑rejuvenation procedures.",
      submittedAt: "2026‑04‑04",
      status: "pending",
    },
    {
      id: 104,
      name: "Dr. Rohan Gupta",
      email: "rohan.gupta@example.com",
      phone: "+91 99887 66554",
      specialty: "Neurologist",
      experience: 19,
      degree: "MBBS, MD (Neurology)",
      registrationNumber: "WB/26784",
      clinicName: "Brain & Spine Neuro Care",
      clinicAddress: "12, Gariahat Road, Kolkata",
      bio: "Senior neurologist with expertise in stroke management, epilepsy, and movement disorders. Regularly conducts weekly OPD and tele‑consultations.",
      submittedAt: "2026‑04‑03",
      status: "pending",
    },
  ]);

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full flex items-center gap-1">
            <Clock size={12} /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
            <Check size={12} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full flex items-center gap-1">
            <X size={12} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "approved" } : req
      )
    );
    // Later: API call → approveDoctorRequest(id)
    console.log("✅ Approved request", id);
  };

  const handleReject = (id) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "rejected" } : req
      )
    );
    // Later: API call → rejectDoctorRequest(id)
    console.log("❌ Rejected request", id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Doctor Registration Requests
      </h2>

      <p className="text-sm text-slate-500 max-w-3xl">
        Review and approve or reject new doctor onboarding requests.
      </p>

      <div className="space-y-6">
        {requests.map((req) => (
          <motion.div
            key={req.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Doctor header */}
            <div className="flex flex-col md:flex-row gap-6 mb-5">
              {/* Avatar */}
              <div className="flex-shrink-0 w-18 h-18 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">
                  {req.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {req.name}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {req.experience} years experience
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                    <Stethoscope size={14} /> {req.specialty}
                  </span>
                  {statusBadge(req.status)}
                </div>
              </div>

              {/* Action buttons – only show when pending */}
              {req.status === "pending" && (
                <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(req.id)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
                  >
                    <Check size={16} /> Approve
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReject(req.id)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition"
                  >
                    <X size={16} /> Reject
                  </motion.button>
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-sm text-slate-600">
              <div className="space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <User size={14} className="text-slate-400" />
                  Personal
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span> {req.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {req.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {req.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <BadgeCheck size={14} className="text-slate-400" />
                  Registration
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Specialty:</span>{" "}
                    {req.specialty}
                  </p>
                  <p>
                    <span className="font-medium">Reg. No:</span>{" "}
                    {req.registrationNumber}
                  </p>
                  <p>
                    <span className="font-medium">Experience:</span>{" "}
                    {req.experience} years
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <Stethoscope size={14} className="text-slate-400" />
                  Practice
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Clinic/Hospital:</span>{" "}
                    {req.clinicName}
                  </p>
                  <p className="flex items-start gap-1">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    {req.clinicAddress}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <GraduationCap size={14} className="text-slate-400" />
                  Education & Bio
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Degree:</span> {req.degree}
                  </p>
                  <p className="text-xs leading-snug">
                    {req.bio.length > 120
                      ? req.bio.slice(0, 120) + "…"
                      : req.bio}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DoctorRequestApproval;