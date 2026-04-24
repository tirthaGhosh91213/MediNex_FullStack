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
app.use("/uploads", express.static("uploads")); // Serve uploaded images

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

// ── Start Server (httpServer, not app.listen) ───────────────────
// We use httpServer.listen() because Socket.io is attached to httpServer
httpServer.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port} (Socket.io enabled)`)
);