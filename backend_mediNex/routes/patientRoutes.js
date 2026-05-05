import express from "express";
import {
  registerPatient,
  loginPatient,
  getPatientProfile,
  searchDoctors,
  getDoctorDetails,
  createBooking,
  getMyBookings,
  updatePatientLocation,
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
patientRouter.put("/location", verifyToken, updatePatientLocation);

// ── Phase 3: Doctor Search & Filter ─────────────────────────────
patientRouter.get("/doctors", searchDoctors);
patientRouter.get("/doctors/:id", getDoctorDetails);

// ── Phase 3: Smart Booking System ───────────────────────────────
patientRouter.post("/book", verifyToken, createBooking);
patientRouter.get("/my-bookings", verifyToken, getMyBookings);

// ── Phase 10: Emergency Booking ─────────────────────────────────
import { getNearbyDoctors, createEmergencyBooking } from "../controllers/patientController.js";
patientRouter.get("/emergency/nearby", verifyToken, getNearbyDoctors);
patientRouter.post("/emergency/book", verifyToken, createEmergencyBooking);

// ── Phase 8: Patient Health Vault & Reviews ───────────────────────
import { upload } from "../config/cloudinary.js";
import { uploadHealthRecord, getHealthVault, deleteHealthRecord, submitReview, getMyMessages, clearMessage } from "../controllers/patientController.js";

patientRouter.post("/vault/upload", verifyToken, upload.array("health_record", 10), uploadHealthRecord);
patientRouter.get("/vault", verifyToken, getHealthVault);
patientRouter.delete("/vault/:recordId", verifyToken, deleteHealthRecord);
patientRouter.post("/review/:bookingId", verifyToken, submitReview);

// ── Phase 9: Patient Messages ─────────────────────────────────────
patientRouter.get("/messages", verifyToken, getMyMessages);
patientRouter.delete("/messages/:id", verifyToken, clearMessage);

// ── Phase 14: AI Assistant & Alarms ───────────────────────────────
import { toggleMedicationAlarm, updateMedicationAlarmTimes, uploadPatientAvatar, uploadPatientRingtone, deletePatientRingtone } from "../controllers/patientController.js";
import { checkSymptoms, analyzePrescription } from "../controllers/aiController.js";

patientRouter.post("/profile/avatar", verifyToken, upload.single("avatar"), uploadPatientAvatar);
patientRouter.post("/profile/ringtone", verifyToken, upload.single("ringtone"), uploadPatientRingtone);
patientRouter.delete("/profile/ringtone", verifyToken, deletePatientRingtone);
patientRouter.post("/ai/symptom-checker", verifyToken, checkSymptoms);
patientRouter.post("/ai/analyze-prescription", verifyToken, upload.single("prescription"), analyzePrescription);
patientRouter.put("/alarms/:alarmId/toggle", verifyToken, toggleMedicationAlarm);
patientRouter.put("/alarms/:alarmId/times", verifyToken, updateMedicationAlarmTimes);

export default patientRouter;
