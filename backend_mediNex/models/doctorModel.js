import mongoose from "mongoose";

/**
 * Doctor Schema
 * -------------
 * Doctors are added by Brokers and require admin verification.
 * - Each doctor belongs to exactly one Broker (brokerId → Broker._id).
 * - Admin must verify the doctor (is_verified = true) before they appear to patients.
 *
 * Relationships:
 *   Doctor  N ──► 1  Broker    (many doctors under one broker/clinic)
 *   Doctor  1 ──► N  Booking   (patients book appointments with doctors)
 */
const doctorSchema = new mongoose.Schema(
  {
    // Reference to the Broker who added this doctor
    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Broker",
      required: [true, "Broker reference is required"],
    },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      // Private - only visible to clinic (broker) and admin, NOT patients
      select: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    degree: {
      type: String,
      default: "MBBS",
      trim: true,
    },
    medical_reg_number: {
      type: String,
      required: [true, "Medical registration number is required"],
      unique: true,
      trim: true,
    },
    experience: {
      type: Number, // years of experience
      default: 0,
    },
    fees: {
      type: Number,
      required: [true, "Consultation fees are required"],
      min: [0, "Fees cannot be negative"],
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Medical registration certificate image (private)
    registration_certificate: {
      type: String,
      default: "",
    },
    // Weekly schedule: [{day, from, to, max_patients}]
    schedule: {
      type: [
        {
          day: { type: String, required: true }, // "Monday", "Tuesday" etc.
          from: { type: String, required: true }, // "10:00"
          to: { type: String, required: true },   // "13:30"
          max_patients: { type: Number, default: 20 },
        },
      ],
      default: [],
    },
    max_patients_per_day: {
      type: Number,
      default: 20,
    },
    // Admin verifies the doctor's credentials before they go live
    is_verified: {
      type: Boolean,
      default: false,
    },
    // Legacy simple slots (kept for backwards compatibility)
    available_slots: {
      type: [String],
      default: [],
    },
    // Phase 8: Review & Rating System
    ratings: [
      {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
        score: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, default: "" },
      },
    ],
    average_rating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
