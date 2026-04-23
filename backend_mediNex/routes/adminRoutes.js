import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getPendingBrokers,
  approveBroker,
  getPendingDoctors,
  verifyDoctor,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const adminRouter = express.Router();

/**
 * Admin Routes
 * ────────────
 *
 * PHASE 1 — Auth:
 *   POST   /api/admin/register                  → Create a new admin account
 *   POST   /api/admin/login                     → Login and get JWT
 *   GET    /api/admin/profile                    → Get admin profile
 *
 * PHASE 2 — Broker Approval:
 *   GET    /api/admin/brokers/pending            → List unapproved brokers
 *   PUT    /api/admin/brokers/approve/:brokerId  → Approve a broker
 *
 * PHASE 2 — Doctor Verification:
 *   GET    /api/admin/doctors/pending            → List unverified doctors (with broker details)
 *   PUT    /api/admin/doctors/verify/:doctorId   → Verify a doctor
 */

// ── Public routes ───────────────────────────────────────────────
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);

// ── Protected routes (requires valid JWT + admin role) ──────────
adminRouter.get("/profile", verifyToken, isAdmin, getAdminProfile);

// ── Phase 2: Broker Approval Workflow ───────────────────────────
adminRouter.get("/brokers/pending", verifyToken, isAdmin, getPendingBrokers);
adminRouter.put("/brokers/approve/:brokerId", verifyToken, isAdmin, approveBroker);

// ── Phase 2: Doctor Verification Workflow ───────────────────────
adminRouter.get("/doctors/pending", verifyToken, isAdmin, getPendingDoctors);
adminRouter.put("/doctors/verify/:doctorId", verifyToken, isAdmin, verifyDoctor);

export default adminRouter;
