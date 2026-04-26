import Booking from "../models/bookingModel.js";

/**
 * Queue Controller
 * ────────────────
 * Provides the live "Now Serving" queue data for patients waiting.
 * This is a public/patient-accessible endpoint.
 */

// ── Live Queue Tracker ──────────────────────────────────────────
// Route: GET /api/queue/live/:doctorId
// Access: Public (or logged-in patient)
//
// Logic:
//   Find the booking for this doctor, for TODAY, where status = 'In-Progress'
//   Return the queue_token_number → this is the "Now Serving" number
//   Also return summary stats: total accepted today, total completed, etc.
export const getLiveQueue = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const dateFilter = {
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    // 1. Find the currently "In-Progress" booking (the one being served now)
    const currentlyServing = await Booking.findOne({
      ...dateFilter,
      status: "In-Progress",
    })
      .populate({ path: "doctorId", select: "name specialization" })
      .populate({ path: "patientId", select: "name" });

    // 1b. If no one is In-Progress, find the last Completed one
    const lastCompleted = !currentlyServing
      ? await Booking.findOne({
          ...dateFilter,
          status: "Completed",
        }).sort({ updatedAt: -1 })
      : null;

    // Determine the Now Serving token
    let nowServingData = null;
    if (currentlyServing) {
      nowServingData = {
        token: currentlyServing.queue_token_number,
        status: "In-Progress",
      };
    } else if (lastCompleted) {
      nowServingData = {
        token: lastCompleted.queue_token_number,
        status: "Completed",
      };
    }

    // 2. Get queue summary stats for today
    const [totalToday, pending, accepted, completed] = await Promise.all([
      Booking.countDocuments({ ...dateFilter, booking_mode: "Offline", status: { $nin: ["Cancelled"] } }),
      Booking.countDocuments({ ...dateFilter, status: "Pending" }),
      Booking.countDocuments({ ...dateFilter, status: "Accepted" }),
      Booking.countDocuments({ ...dateFilter, status: "Completed" }),
    ]);

    // 3. Get the list of upcoming (Accepted) patients in queue order
    const upcomingQueue = await Booking.find({
      ...dateFilter,
      status: "Accepted",
      booking_mode: "Offline",
    })
      .select("queue_token_number time_slot patientId")
      .populate({ path: "patientId", select: "name" })
      .sort({ queue_token_number: 1 });

    res.status(200).json({
      success: true,
      nowServing: nowServingData,
      stats: {
        totalToday,
        pending,
        accepted,
        inProgress: currentlyServing ? 1 : 0,
        completed,
      },
      upcomingQueue: upcomingQueue.map((b) => ({
        token: b.queue_token_number,
        time_slot: b.time_slot,
        patientName: b.patientId?.name || "Patient",
      })),
    });
  } catch (error) {
    console.error("Get Live Queue Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching live queue.",
    });
  }
};
