import mongoose from "mongoose";

/**
 * Patient Schema
 * --------------
 * Patients register on the platform to book appointments with doctors.
 * - Patients can search for nearby clinics using their location.
 * - Each patient can have many bookings (Booking.patientId → Patient._id).
 *
 * Relationships:
 *   Patient  1 ──► N  Booking   (a patient books many appointments)
 */
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    dob: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    // Patient's location for nearby-clinic search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    address: {
      type: String,
      default: "",
    },
    // Phase 8: Patient Health Vault
    health_records: [
      {
        title: { type: String, required: true },
        file_url: { type: String, required: true },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for "find clinics near me"
patientSchema.index({ location: "2dsphere" });

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
