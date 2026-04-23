import mongoose from "mongoose";

/**
 * Booking Schema
 * --------------
 * The central entity that ties Patient, Doctor, and Broker together.
 *
 * Relationships:
 *   Booking  N ──► 1  Patient   (which patient booked)
 *   Booking  N ──► 1  Doctor    (which doctor is being visited)
 *   Booking  N ──► 1  Broker    (which clinic/broker the doctor belongs to)
 *
 * Fields:
 *   booking_mode — Whether the appointment is Online (teleconsultation) or Offline (in-person)
 *   queue_token_number — Auto-assigned token for walk-in / waiting-room queue management
 *   status — Lifecycle: Pending → Accepted → In-Progress → Completed (or Cancelled)
 */
const bookingSchema = new mongoose.Schema(
  {
    // ── References ──────────────────────────────────────────────
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient reference is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor reference is required"],
    },
    brokerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Broker",
      required: [true, "Broker reference is required"],
    },

    // ── Booking Details ─────────────────────────────────────────
    booking_mode: {
      type: String,
      enum: {
        values: ["Online", "Offline"],
        message: "Booking mode must be either 'Online' or 'Offline'",
      },
      required: [true, "Booking mode is required"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    time_slot: {
      type: String, // e.g. "10:00 AM"
      required: [true, "Time slot is required"],
    },

    // Auto-assigned queue number for the day (managed by controller)
    queue_token_number: {
      type: Number,
      default: 0,
    },

    // ── Status Lifecycle ────────────────────────────────────────
    // Pending → Accepted → In-Progress → Completed (or Cancelled at any point)
    status: {
      type: String,
      enum: {
        values: ["Pending", "Accepted", "In-Progress", "Completed", "Cancelled"],
        message: "Status must be Pending, Accepted, In-Progress, Completed, or Cancelled",
      },
      default: "Pending",
    },

    // Optional notes from doctor/patient
    notes: {
      type: String,
      default: "",
    },

    // ── Phase 6: Online Consultation ────────────────────────────
    // Generated when broker accepts an Online booking (UUID-based room ID)
    // Both doctor and patient use this to join the same video room
    meeting_link: {
      type: String,
      default: "",
    },

    // URL of the uploaded e-prescription (PDF/Image on Cloudinary/Firebase)
    // Set when the consultation is completed
    prescription_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups: "all bookings for a doctor on a given date"
bookingSchema.index({ doctorId: 1, date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
