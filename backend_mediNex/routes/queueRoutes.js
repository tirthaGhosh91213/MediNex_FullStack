import express from "express";
import { getLiveQueue } from "../controllers/queueController.js";

const queueRouter = express.Router();

/**
 * Queue Routes (Public / Patient accessible)
 * ───────────────────────────────────────────
 *
 * PHASE 4 — Live Queue:
 *   GET    /api/queue/live/:doctorId   → Get "Now Serving" token + queue summary for today
 */

// ── Public route (no auth needed — displayed on waiting room screens) ──
queueRouter.get("/live/:doctorId", getLiveQueue);

export default queueRouter;
