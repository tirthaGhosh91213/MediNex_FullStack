import express from "express";
import {
  registerPatient,
  loginPatient,
  getPatientProfile,
  searchDoctors,
  getDoctorDetails,
  createBooking,
  getMyBookings,
} from "../controllers/patientController.js";
import { verifyToken } from "../middleware/auth.js";

const patientRouter = express.Router();

/**
 * Patient Routes
 * ──────────────
 *
 * PHASE 1 — Auth:
 *   POST   /api/patient/register       → Register a new patient
 *   POST   /api/patient/login          → Login and get JWT
 *   GET    /api/patient/profile         → Get patient profile
 *
 * PHASE 3 — Search & Filter:
 *   GET    /api/patient/doctors         → Search verified doctors (?specialization=X&name=Y)
 *
 * PHASE 3 — Smart Booking:
 *   POST   /api/patient/book           → Book an appointment (auto queue token for Offline)
 *   GET    /api/patient/my-bookings    → Get patient's booking history
 */

// ── Public routes ───────────────────────────────────────────────
patientRouter.post("/register", registerPatient);
patientRouter.post("/login", loginPatient);

// ── Protected routes (requires valid JWT) ───────────────────────
patientRouter.get("/profile", verifyToken, getPatientProfile);

// ── Phase 3: Doctor Search & Filter ─────────────────────────────
patientRouter.get("/doctors", searchDoctors);
patientRouter.get("/doctors/:id", verifyToken, getDoctorDetails);

// ── Phase 3: Smart Booking System ───────────────────────────────
patientRouter.post("/book", verifyToken, createBooking);
patientRouter.get("/my-bookings", verifyToken, getMyBookings);

// ── Phase 8: Patient Health Vault & Reviews ───────────────────────
import { upload } from "../config/cloudinary.js";
import { uploadHealthRecord, getHealthVault, submitReview } from "../controllers/patientController.js";

patientRouter.post("/vault/upload", verifyToken, upload.single("health_record"), uploadHealthRecord);
patientRouter.get("/vault", verifyToken, getHealthVault);
patientRouter.post("/review/:bookingId", verifyToken, submitReview);

export default patientRouter;
