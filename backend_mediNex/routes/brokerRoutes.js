import express from "express";
import {
  registerBroker,
  loginBroker,
  getBrokerProfile,
  addDoctor,
  getBrokerDoctors,
  updateBrokerLocation,
  getBrokerNotifications,
  clearBrokerNotifications,
} from "../controllers/brokerController.js";
import {
  getBrokerBookings,
  acceptBooking,
  updateBookingStatus,
  completeWithPrescription,
} from "../controllers/bookingController.js";
import { verifyToken, isBroker } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const brokerRouter = express.Router();

/**
 * Broker Routes
 * ─────────────
 *
 * PHASE 1 — Auth:
 *   POST   /api/broker/register                       → Register a new broker
 *   POST   /api/broker/login                          → Login and get JWT
 *   GET    /api/broker/profile                         → Get broker profile
 *
 * PHASE 2 — Doctor Onboarding:
 *   POST   /api/broker/doctors/add                    → Add a new doctor
 *   GET    /api/broker/doctors                         → List broker's doctors
 *
 * PHASE 4 — Booking Management:
 *   GET    /api/broker/bookings                        → List bookings (?date=&status=)
 *   PUT    /api/broker/bookings/:bookingId/accept     → Accept booking (+ meeting link for Online)
 *   PUT    /api/broker/bookings/:bookingId/status     → Update status (In-Progress / Completed)
 *
 * PHASE 5 — Geolocation:
 *   PUT    /api/broker/location                        → Update clinic lat/lng/address
 *
 * PHASE 6 — E-Prescription:
 *   PUT    /api/broker/bookings/:bookingId/complete   → Complete with prescription URL
 */

// ── Public routes ───────────────────────────────────────────────
brokerRouter.post("/register", upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'license', maxCount: 1 }
]), registerBroker);
brokerRouter.post("/login", loginBroker);

// ── Protected routes (requires valid JWT + broker role) ─────────
brokerRouter.get("/profile", verifyToken, isBroker, getBrokerProfile);

// ── Phase 2: Doctor Onboarding ──────────────────────────────────
brokerRouter.post("/doctors/add", verifyToken, isBroker, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'registration_certificate', maxCount: 1 },
]), addDoctor);
brokerRouter.get("/doctors", verifyToken, isBroker, getBrokerDoctors);

// ── Phase 4: Booking Management ─────────────────────────────────
brokerRouter.get("/bookings", verifyToken, isBroker, getBrokerBookings);
brokerRouter.put("/bookings/:bookingId/accept", verifyToken, isBroker, acceptBooking);
brokerRouter.put("/bookings/:bookingId/status", verifyToken, isBroker, updateBookingStatus);

// ── Phase 5: Clinic Geolocation ─────────────────────────────────
brokerRouter.put("/location", verifyToken, isBroker, updateBrokerLocation);

// ── Phase 6: E-Prescription & Consultation Completion ───────────
brokerRouter.put("/bookings/:bookingId/complete", verifyToken, isBroker, completeWithPrescription);

// ── Phase 8: Access Health Vault ────────────────────────────────
import { getPatientRecords } from "../controllers/brokerController.js";
brokerRouter.get("/patient-records/:patientId", verifyToken, isBroker, getPatientRecords);

// ── Notifications ───────────────────────────────────────────────
brokerRouter.get("/notifications", verifyToken, isBroker, getBrokerNotifications);
brokerRouter.delete("/notifications/clear", verifyToken, isBroker, clearBrokerNotifications);

export default brokerRouter;
