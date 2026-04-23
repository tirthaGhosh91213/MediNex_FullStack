import { v4 as uuidv4 } from "uuid";
import Booking from "../models/bookingModel.js";

/**
 * Booking Controller (Broker-facing)
 * ───────────────────────────────────
 * Handles broker's management of patient bookings:
 *   - View bookings (filtered by date/status)
 *   - Accept pending bookings
 *   - Update status (In-Progress, Completed)
 *
 * Socket.io events are emitted through req.app.get("io")
 * which is set in server.js during initialization.
 */

// ── Helper: Get today's date range ──────────────────────────────
const getDayRange = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ═══════════════════════════════════════════════════════════════════
//  TASK 1: BROKER BOOKING MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// ── Get All Bookings for Broker ─────────────────────────────────
// Route: GET /api/broker/bookings
// Access: Broker only
// Query Params:
//   ?date=2026-04-23     → filter by date (defaults to today)
//   ?status=Pending      → filter by status
// Populates Patient and Doctor details
export const getBrokerBookings = async (req, res) => {
  try {
    const brokerId = req.user.id;
    const { date, status } = req.query;

    // Build filter — always scoped to this broker
    const filter = { brokerId };

    // Date filter (defaults to today if not provided)
    const { start, end } = getDayRange(date);
    filter.date = { $gte: start, $lte: end };

    // Optional status filter
    if (status) {
      const validStatuses = ["Pending", "Accepted", "In-Progress", "Completed", "Cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: "patientId",
        select: "name email phone gender avatar",
      })
      .populate({
        path: "doctorId",
        select: "name specialization degree fees",
      })
      .sort({ queue_token_number: 1, createdAt: 1 }); // sort by token number for queue order

    res.status(200).json({
      success: true,
      count: bookings.length,
      date: start.toISOString().split("T")[0],
      bookings,
    });
  } catch (error) {
    console.error("Get Broker Bookings Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings.",
    });
  }
};

// ── Accept a Booking ────────────────────────────────────────────
// Route: PUT /api/broker/bookings/:bookingId/accept
// Access: Broker only
// Transitions: Pending → Accepted
// Socket.io: Emits 'bookingAccepted' to the patient's room
export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const brokerId = req.user.id;

    // 1. Find the booking and verify it belongs to this broker
    const booking = await Booking.findOne({ _id: bookingId, brokerId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or does not belong to your clinic.",
      });
    }

    // 2. Validate current status — can only accept from 'Pending'
    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a booking with status '${booking.status}'. Only 'Pending' bookings can be accepted.`,
      });
    }

    // 3. Update status
    booking.status = "Accepted";

    // ── Phase 6: Generate meeting link for Online bookings ──────
    // When a broker accepts an Online booking, we generate a unique
    // meeting room ID using UUID. Both doctor and patient use this
    // same ID to join the video consultation room.
    let meeting_link = "";
    if (booking.booking_mode === "Online") {
      meeting_link = `mediconnect-room-${uuidv4()}`;
      booking.meeting_link = meeting_link;
    }

    await booking.save();

    // 4. Populate for rich response
    await booking.populate([
      { path: "patientId", select: "name email phone" },
      { path: "doctorId", select: "name specialization" },
    ]);

    // 5. Emit Socket.io event — notify the patient that their booking is accepted
    const io = req.app.get("io");
    if (io) {
      const eventPayload = {
        bookingId: booking._id,
        doctorName: booking.doctorId.name,
        date: booking.date,
        time_slot: booking.time_slot,
        status: "Accepted",
        message: `Your appointment with ${booking.doctorId.name} has been accepted!`,
      };

      // Include meeting link in the socket event for Online bookings
      // so the patient immediately sees the "Join Call" button
      if (meeting_link) {
        eventPayload.meeting_link = meeting_link;
        eventPayload.message += " Your video consultation room is ready.";
      }

      io.to(`patient_${booking.patientId._id}`).emit("bookingAccepted", eventPayload);
    }

    res.status(200).json({
      success: true,
      message: booking.booking_mode === "Online"
        ? "Booking accepted. Video consultation room created."
        : "Booking accepted successfully.",
      booking,
    });
  } catch (error) {
    console.error("Accept Booking Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while accepting booking.",
    });
  }
};

// ── Update Booking Status ───────────────────────────────────────
// Route: PUT /api/broker/bookings/:bookingId/status
// Access: Broker only
// Allowed transitions:
//   Accepted → In-Progress  (patient enters the chamber)
//   In-Progress → Completed (treatment finished)
// Socket.io: Emits 'queueUpdated' with the current "Now Serving" token
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const brokerId = req.user.id;

    // 1. Validate the new status
    const allowedStatuses = ["In-Progress", "Completed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    // 2. Find the booking and verify it belongs to this broker
    const booking = await Booking.findOne({ _id: bookingId, brokerId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or does not belong to your clinic.",
      });
    }

    // 3. Enforce valid status transitions
    const validTransitions = {
      "Accepted": ["In-Progress"],
      "In-Progress": ["Completed"],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: Cannot change status from '${booking.status}' to '${status}'. Allowed: ${booking.status} → ${(allowed || []).join(" / ") || "none"}`,
      });
    }

    // 4. Update status
    booking.status = status;
    await booking.save();

    // 5. Populate for rich response and socket event
    await booking.populate([
      { path: "patientId", select: "name email phone" },
      { path: "doctorId", select: "name specialization" },
    ]);

    // 6. Socket.io events
    const io = req.app.get("io");
    if (io) {
      const doctorId = booking.doctorId._id.toString();

      if (status === "In-Progress") {
        // ── Emit 'queueUpdated' to everyone watching this doctor's queue ──
        // This broadcasts the "Now Serving" token number
        io.to(`queue_${doctorId}`).emit("queueUpdated", {
          doctorId,
          doctorName: booking.doctorId.name,
          nowServing: booking.queue_token_number,
          patientName: booking.patientId.name,
          bookingId: booking._id,
        });

        // Also notify the specific patient
        io.to(`patient_${booking.patientId._id}`).emit("yourTurn", {
          bookingId: booking._id,
          message: "It's your turn! Please proceed to the doctor's chamber.",
          queue_token_number: booking.queue_token_number,
        });
      }

      if (status === "Completed") {
        // Notify patient that their appointment is complete
        io.to(`patient_${booking.patientId._id}`).emit("bookingCompleted", {
          bookingId: booking._id,
          doctorName: booking.doctorId.name,
          message: "Your appointment has been completed. Thank you!",
        });

        // Update the queue display — find next "In-Progress" or show nothing
        const nextInProgress = await Booking.findOne({
          doctorId: booking.doctorId._id,
          date: booking.date,
          status: "In-Progress",
        });

        io.to(`queue_${doctorId}`).emit("queueUpdated", {
          doctorId,
          doctorName: booking.doctorId.name,
          nowServing: nextInProgress ? nextInProgress.queue_token_number : null,
          message: nextInProgress
            ? `Now serving token #${nextInProgress.queue_token_number}`
            : "No patient currently being served.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking status.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 6: E-PRESCRIPTION UPLOAD & CONSULTATION COMPLETION
// ═══════════════════════════════════════════════════════════════════

// ── Complete Booking with Prescription ───────────────────────────
// Route: PUT /api/broker/bookings/:bookingId/complete
// Access: Broker only
// Payload: { prescription_url } — URL from Cloudinary/Firebase upload
//
// Logic:
//   1. Sets booking status to 'Completed'
//   2. Saves the prescription_url for patient download
//   3. Emits 'consultationCompleted' socket event with prescription link
export const completeWithPrescription = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { prescription_url } = req.body;
    const brokerId = req.user.id;

    // 1. Validate prescription URL
    if (!prescription_url) {
      return res.status(400).json({
        success: false,
        message: "prescription_url is required. Upload the prescription file first, then send the URL.",
      });
    }

    // 2. Find the booking and verify it belongs to this broker
    const booking = await Booking.findOne({ _id: bookingId, brokerId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or does not belong to your clinic.",
      });
    }

    // 3. Validate status — can only complete from 'Accepted' or 'In-Progress'
    if (!['Accepted', 'In-Progress'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a booking with status '${booking.status}'. Booking must be 'Accepted' or 'In-Progress'.`,
      });
    }

    // 4. Update booking
    booking.status = "Completed";
    booking.prescription_url = prescription_url;
    await booking.save();

    // 5. Populate for response
    await booking.populate([
      { path: "patientId", select: "name email phone" },
      { path: "doctorId", select: "name specialization" },
    ]);

    // 6. Emit Socket.io event — patient can download prescription immediately
    const io = req.app.get("io");
    if (io) {
      io.to(`patient_${booking.patientId._id}`).emit("consultationCompleted", {
        bookingId: booking._id,
        doctorName: booking.doctorId.name,
        prescription_url: booking.prescription_url,
        booking_mode: booking.booking_mode,
        message: `Your consultation with ${booking.doctorId.name} is complete. Your e-prescription is ready for download.`,
      });

      // If offline booking, also update the queue display
      if (booking.booking_mode === "Offline") {
        const doctorId = booking.doctorId._id.toString();
        const nextInProgress = await Booking.findOne({
          doctorId: booking.doctorId._id,
          date: booking.date,
          status: "In-Progress",
        });

        io.to(`queue_${doctorId}`).emit("queueUpdated", {
          doctorId,
          doctorName: booking.doctorId.name,
          nowServing: nextInProgress ? nextInProgress.queue_token_number : null,
          message: nextInProgress
            ? `Now serving token #${nextInProgress.queue_token_number}`
            : "No patient currently being served.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Consultation completed. E-prescription saved and patient notified.",
      booking,
    });
  } catch (error) {
    console.error("Complete With Prescription Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while completing consultation.",
    });
  }
};
