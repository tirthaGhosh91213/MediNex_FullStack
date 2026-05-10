import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import connectDB from "./config/mongodb.js";

// ── Import Route Modules ────────────────────────────────────────
import adminRouter from "./routes/adminRoutes.js";
import brokerRouter from "./routes/brokerRoutes.js";
import patientRouter from "./routes/patientRoutes.js";
import queueRouter from "./routes/queueRoutes.js";
import cron from "node-cron";
import PatientMessage from "./models/patientMessageModel.js";
import Booking from "./models/bookingModel.js";
import Patient from "./models/patientModel.js";

// ── Initialize Express App ──────────────────────────────────────
const app = express();
const port = process.env.PORT || 4000;

// ── Create HTTP Server (required for Socket.io) ─────────────────
// Socket.io needs a raw http.Server, not Express's built-in listener
const httpServer = createServer(app);

// ── Initialize Socket.io ────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*", // In production, restrict to your frontend domain
    methods: ["GET", "POST", "PUT"],
  },
});

// Store io instance on the Express app so controllers can access it
// Controllers use: req.app.get("io") to emit events
app.set("io", io);

// ── Socket.io Connection Handling ───────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // ── Patient joins their personal room ──────────────────────
  // Frontend emits: socket.emit("joinPatientRoom", patientId)
  // This allows us to send targeted notifications to a specific patient
  socket.on("joinPatientRoom", (patientId) => {
    socket.join(`patient_${patientId}`);
    console.log(`👤 Patient ${patientId} joined room: patient_${patientId}`);
  });

  // ── Patient/User joins a doctor's queue room ───────────────
  // Frontend emits: socket.emit("joinQueueRoom", doctorId)
  // This allows the waiting room display to get live queue updates
  socket.on("joinQueueRoom", (doctorId) => {
    socket.join(`queue_${doctorId}`);
    console.log(`📋 Client joined queue room: queue_${doctorId}`);
  });

  // ── Broker joins their clinic room ─────────────────────────
  // Frontend emits: socket.emit("joinBrokerRoom", brokerId)
  socket.on("joinBrokerRoom", (brokerId) => {
    socket.join(`broker_${brokerId}`);
    console.log(`🏥 Broker ${brokerId} joined room: broker_${brokerId}`);
  });

  // ── WebRTC Signaling & Telemedicine Events ─────────────────
  socket.on("joinTelemedicineRoom", (roomId) => {
    socket.join(`telemed_${roomId}`);
    console.log(`📹 Client joined telemedicine room: telemed_${roomId}`);
    socket.to(`telemed_${roomId}`).emit("user-connected", socket.id);
  });

  socket.on("webrtc_offer", (data) => {
    socket.to(`telemed_${data.roomId}`).emit("webrtc_offer", {
      sdp: data.sdp,
      senderId: socket.id
    });
  });

  socket.on("webrtc_answer", (data) => {
    socket.to(`telemed_${data.roomId}`).emit("webrtc_answer", {
      sdp: data.sdp,
      senderId: socket.id
    });
  });

  socket.on("webrtc_ice_candidate", (data) => {
    socket.to(`telemed_${data.roomId}`).emit("webrtc_ice_candidate", {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  socket.on("you_are_next", (data) => {
    io.to(`patient_${data.patientId}`).emit("you_are_next", data);
  });

  socket.on("doctor_ready", (data) => {
    socket.to(`telemed_${data.roomId}`).emit("doctor_ready", { senderId: socket.id });
  });

  socket.on("patient_ready", (data) => {
    socket.to(`telemed_${data.roomId}`).emit("patient_ready", { senderId: socket.id });
  });

  socket.on("start_telemed_session", async (data) => {
    try {
      const booking = await Booking.findById(data.bookingId);
      if (booking) {
        booking.is_session_started = true;
        if (booking.status === "Pending") booking.status = "Accepted";
        if (!booking.meeting_link) {
          booking.meeting_link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/session/${data.roomId}`;
        }
        await booking.save();
      }
      io.to(`patient_${data.patientId}`).emit("sessionStarted", {
        bookingId: data.bookingId,
        message: "The doctor is ready for you! Please join the call now.",
        meeting_link: booking?.meeting_link || `${process.env.FRONTEND_URL || "http://localhost:5173"}/session/${data.roomId}`
      });
    } catch (err) {
      console.error("Error starting telemed session:", err);
    }
  });

  socket.on("end_telemed_call", async (data) => {
    try {
      if (data.bookingId) {
        const booking = await Booking.findById(data.bookingId);
        if (booking) {
          booking.status = "Completed";
          await booking.save();
        }
      }
      if (data.patientId) {
        io.to(`patient_${data.patientId}`).emit("sessionEnded", {
          bookingId: data.bookingId,
          message: "Your consultation has ended. Thank you."
        });
      }
      socket.to(`telemed_${data.roomId}`).emit("end_telemed_call");
    } catch (err) {
      console.error("Error ending telemed session:", err);
    }
  });

  socket.on("chat_message", (data) => {
    io.to(`telemed_${data.roomId}`).emit("chat_message", data);
  });

  // ── Handle disconnection ───────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

// ── Global Middleware ───────────────────────────────────────────
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for frontend requests
// Files are served from Cloudinary CDN — no local static file serving needed

// ── Health Check ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediConnect AI API is running 🚀",
    version: "2.0.0",
    realtime: "Socket.io enabled",
    endpoints: {
      admin: "/api/admin",
      broker: "/api/broker",
      patient: "/api/patient",
      queue: "/api/queue",
    },
  });
});

// ── API Routes ──────────────────────────────────────────────────
app.use("/api/admin", adminRouter);     // Admin auth + approval + verification
app.use("/api/broker", brokerRouter);   // Broker auth + doctors + booking management
app.use("/api/patient", patientRouter); // Patient auth + search + booking
app.use("/api/queue", queueRouter);     // Live queue tracker (public)

// ── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ── Cron Jobs ───────────────────────────────────────────────────
// Run every day at midnight to clear patient broadcast messages
// Run every day at midnight to clear patient broadcast messages and expired alarms
cron.schedule("0 0 * * *", async () => {
  try {
    // 1. Clear old broadcast messages
    await PatientMessage.deleteMany({});
    console.log("🧹 Cron Job: Cleared all patient broadcast messages for the new day.");

    // 2. Clear expired AI medication alarms
    const patients = await Patient.find({ "medication_alarms.0": { $exists: true } });
    let expiredCount = 0;

    for (let patient of patients) {
      const now = new Date();
      const originalLength = patient.medication_alarms.length;

      patient.medication_alarms = patient.medication_alarms.filter((alarm) => {
        const addedAt = new Date(alarm.addedAt);
        // Add durationDays to addedAt
        const expiresAt = new Date(addedAt);
        expiresAt.setDate(expiresAt.getDate() + alarm.durationDays);
        
        // Keep if it hasn't expired yet
        return expiresAt > now;
      });

      if (patient.medication_alarms.length !== originalLength) {
        expiredCount += (originalLength - patient.medication_alarms.length);
        await patient.save();
      }
    }
    if (expiredCount > 0) {
      console.log(`🧹 Cron Job: Cleared ${expiredCount} expired AI medication alarms.`);
    }

  } catch (error) {
    console.error("❌ Cron Job Error:", error);
  }
});

// ── Start Server (httpServer, not app.listen) ───────────────────
// We use httpServer.listen() because Socket.io is attached to httpServer
httpServer.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port} (Socket.io enabled)`)
);