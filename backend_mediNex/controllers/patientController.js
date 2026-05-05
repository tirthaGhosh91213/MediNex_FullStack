import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Broker from "../models/brokerModel.js";
import Booking from "../models/bookingModel.js";
import PatientMessage from "../models/patientMessageModel.js";

/**
 * Patient Auth Controller
 * ───────────────────────
 * Handles patient registration and login.
 * JWT payload: { id, role: "patient" }
 */

// ── Register Patient ────────────────────────────────────────────
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob, location, address } =
      req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone are required.",
      });
    }

    // 2. Check for existing patient
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "A patient with this email already exists.",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Build location (GeoJSON Point)
    const locationData = {
      type: "Point",
      coordinates:
        location && Array.isArray(location.coordinates)
          ? location.coordinates
          : [0, 0],
    };

    // 5. Create patient
    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone,
      gender: gender || "Other",
      dob: dob || null,
      location: locationData,
      address: address || "",
    });

    // 6. Generate JWT
    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Respond
    res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
    });
  } catch (error) {
    console.error("Patient Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ── Login Patient ───────────────────────────────────────────────
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // 2. Find patient
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Respond
    res.status(200).json({
      success: true,
      message: "Patient logged in successfully.",
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
    });
  } catch (error) {
    console.error("Patient Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ── Get Patient Profile (protected) ─────────────────────────────
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get Patient Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ── Update Patient Location ──────────────────────────────────────
export const updatePatientLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const patientId = req.user.id;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    patient.location = {
      type: "Point",
      coordinates: [lng, lat]
    };

    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: "Location updated successfully", 
      location: patient.location 
    });
  } catch (error) {
    console.error("Update Location Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: SEARCH & FILTER DOCTORS
// ═══════════════════════════════════════════════════════════════════

// ── Get Doctor Details ──────────────────────────────────────────
// Route: GET /api/patient/doctors/:id
// Access: Protected
export const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // optional date to check booking count

    const doctor = await Doctor.findById(id)
      .populate({
        path: "brokerId",
        select: "name clinic_name clinic_address clinic_location location phone",
      })
      .populate({
        path: "ratings.patientId",
        select: "name avatar",
      });

    if (!doctor || !doctor.is_verified) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or not verified.",
      });
    }

    let bookingCount = 0;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      bookingCount = await Booking.countDocuments({
        doctorId: id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ["Cancelled"] },
      });
    }

    res.status(200).json({
      success: true,
      doctor,
      bookingCount,
    });
  } catch (error) {
    console.error("Get Doctor Details Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctor details.",
    });
  }
};

// ── Search Verified Doctors ─────────────────────────────────────
// Route: GET /api/patient/doctors
// Access: Protected (logged-in patient)
// Query Params:
//   ?specialization=Cardiologist  → filter by specialization
//   ?name=Richard                 → search by doctor name (partial, case-insensitive)
//   ?page=1&limit=10              → pagination
// Only returns doctors where is_verified = true
// Populates brokerId so patient can see Clinic Name and Location
export const searchDoctors = async (req, res) => {
  try {
    const { specialization, name, page = 1, limit = 20 } = req.query;

    // Build the filter — only verified doctors are visible to patients
    const filter = { is_verified: true };

    // Optional: filter by specialization (case-insensitive exact match)
    if (specialization) {
      filter.specialization = { $regex: new RegExp(`^${specialization}$`, "i") };
    }

    // Optional: search by doctor name (partial match, case-insensitive)
    if (name) {
      filter.name = { $regex: new RegExp(name, "i") };
    }

    // Calculate pagination offsets
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch doctors with broker details populated
    const doctors = await Doctor.find(filter)
      .populate({
        path: "brokerId",
        select: "name clinic_name clinic_address clinic_location location phone",
      })
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination metadata
    const total = await Doctor.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      doctors,
    });
  } catch (error) {
    console.error("Search Doctors Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while searching doctors.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: SMART BOOKING SYSTEM
// ═══════════════════════════════════════════════════════════════════

// ── Create a Booking ────────────────────────────────────────────
// Route: POST /api/patient/book
// Access: Protected (logged-in patient)
//
// Payload: { doctorId, booking_mode, date, time_slot }
//
// Smart Logic:
//   1. Validate doctor exists and is verified
//   2. Auto-extract brokerId from the doctor document
//   3. For Offline bookings → auto-assign queue_token_number
//   4. Prevent booking in the past
//   5. Prevent duplicate booking (same doctor, same date, same time slot)
export const createBooking = async (req, res) => {
  try {
    const { doctorId, booking_mode, date, time_slot } = req.body;
    const patientId = req.user.id; // from JWT via verifyToken middleware

    // ── Step 0: Validate required fields ────────────────────────
    if (!doctorId || !booking_mode || !date || !time_slot) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: doctorId, booking_mode, date, time_slot.",
      });
    }

    // Validate booking_mode enum
    if (!['Online', 'Offline'].includes(booking_mode)) {
      return res.status(400).json({
        success: false,
        message: "booking_mode must be either 'Online' or 'Offline'.",
      });
    }

    // ── Step 0b: Prevent booking in the past ────────────────────
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book an appointment in the past.",
      });
    }

    // ── Step 1: Validate doctor exists and is verified ──────────
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    if (!doctor.is_verified) {
      return res.status(400).json({
        success: false,
        message: "This doctor is not yet verified by admin. Booking is not available.",
      });
    }

    // ── Step 1b: Validate against Doctor's Schedule ─────────────
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bookingDayName = days[new Date(date).getDay()];
    
    const scheduleForDay = doctor.schedule.find(s => s.day === bookingDayName && s.mode === booking_mode);
    if (!scheduleForDay) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available for ${booking_mode} consultation on ${bookingDayName}.`,
      });
    }

    // ── Step 1c: Prevent booking if today's slot time has passed ──
    const now = new Date();
    // Compare date safely for local timezone
    if (
      bookingDate.getDate() === now.getDate() &&
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    ) {
      if (scheduleForDay.to) {
        const [endHour, endMin] = scheduleForDay.to.split(":").map(Number);
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        if (currentHour > endHour || (currentHour === endHour && currentMin >= endMin)) {
          return res.status(400).json({
            success: false,
            message: `Booking closed for today. Doctor's slot ended at ${scheduleForDay.to}.`,
          });
        }
      }
    }

    const brokerId = doctor.brokerId;
    
    // Define date boundaries for counting existing bookings
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ── Step 3: Queue Token Generation (Offline bookings only) ──
    //
    // For Offline (in-person) visits, we assign a sequential token number
    // based on how many bookings already exist for this doctor on this date.
    //
    // Algorithm:
    //   Count all non-cancelled bookings for this doctor on this date
    //   queue_token_number = count + 1
    //
    // Example: If 4 patients already booked → new patient gets Token #5
    let queue_token_number = 0; // default for Online bookings

    if (booking_mode === "Offline") {
      const existingCount = await Booking.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        booking_mode: "Offline",
        status: { $nin: ["Cancelled"] }, // don't count cancelled bookings
      });

      // Check against schedule's max_patients
      if (existingCount >= scheduleForDay.max_patients) {
        return res.status(400).json({
          success: false,
          message: "Doctor has reached the maximum patient limit for this day.",
        });
      }

      queue_token_number = existingCount + 1;
    } else {
      // For Online bookings, sequential token specifically for this time slot
      const existingOnlineCount = await Booking.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        booking_mode: "Online",
        time_slot,
        status: { $nin: ["Cancelled"] },
      });

      // Total online count to check max limit
      const totalOnlineCount = await Booking.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        booking_mode: "Online",
        status: { $nin: ["Cancelled"] },
      });

      if (totalOnlineCount >= scheduleForDay.max_patients) {
         return res.status(400).json({
          success: false,
          message: "Doctor has reached the maximum limit for online consultations today.",
        });
      }

      queue_token_number = existingOnlineCount + 1;
    }

    // ── Step 4: Create the booking (status defaults to 'Pending') ─
    const booking = await Booking.create({
      patientId,
      doctorId,
      brokerId,
      booking_mode,
      date: startOfDay, // normalize to start of day for consistent date queries
      time_slot,
      queue_token_number,
      status: "Accepted", // Instant approval upon "payment"
    });

    const io = req.app.get("io");
    if (io) {
      if (booking_mode === "Online") {
        io.to(`telemed_${doctorId}_${time_slot}`).emit("queue_updated");
      }
    }

    res.status(201).json({
      success: true,
      message:
        booking_mode === "Offline"
          ? `Appointment booked successfully! Your queue token number is #${queue_token_number}.`
          : "Online appointment booked successfully! Waiting for confirmation.",
      booking: {
        id: booking._id,
        doctorId: booking.doctorId,
        brokerId: booking.brokerId,
        booking_mode: booking.booking_mode,
        date: booking.date,
        time_slot: booking.time_slot,
        queue_token_number: booking.queue_token_number,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Create Booking Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: PATIENT DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════════

// ── Get My Bookings ─────────────────────────────────────────────
// Route: GET /api/patient/my-bookings
// Access: Protected (logged-in patient)
// Populates Doctor Name/Specialization and Clinic (Broker) details
// Sorted by date (newest first)
export const getMyBookings = async (req, res) => {
  try {
    const patientId = req.user.id;

    const bookings = await Booking.find({ patientId })
      .populate({
        path: "doctorId",
        select: "name specialization degree fees avatar experience",
      })
      .populate({
        path: "brokerId",
        select: "name clinic_name clinic_address clinic_location location phone",
      })
      .sort({ date: -1, createdAt: -1 }); // newest date first, then by creation time

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 10: EMERGENCY BOOKING
// ═══════════════════════════════════════════════════════════════════

// ── Find Nearby Doctors (within radius) ──────────────────────────
// Route: GET /api/patient/emergency/nearby?lat=X&lng=Y&radius=5
export const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required." });
    }

    const radiusKm = parseFloat(radius) || 5;
    const radiusInMeters = radiusKm * 1000;

    // Find brokers within the radius using MongoDB $geoNear / $near
    const nearbyBrokers = await Broker.find({
      is_approved: true,
      "clinic_location.coordinates": { $ne: [0, 0] },
      clinic_location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON: [lng, lat]
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).select("_id clinic_name clinic_address location");

    if (nearbyBrokers.length === 0) {
      return res.status(200).json({
        success: true,
        doctors: [],
        message: `No clinics found within ${radiusKm}km of your location.`,
      });
    }

    const brokerIds = nearbyBrokers.map((b) => b._id);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const todayName = days[now.getDay()];
    
    // Get current time in HH:MM format
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    // Find verified doctors belonging to nearby clinics who are scheduled for today
    let doctors = await Doctor.find({
      brokerId: { $in: brokerIds },
      is_verified: true,
      "schedule.day": todayName
    })
      .populate({
        path: "brokerId",
        select: "clinic_name clinic_address location",
      })
      .select("name specialization avatar fees experience degree schedule");

    // Filter by current time slot
    doctors = doctors.filter(doc => {
      const todaySchedule = doc.schedule.find(s => s.day === todayName);
      if (!todaySchedule || !todaySchedule.from || !todaySchedule.to) return false;
      
      const { from, to } = todaySchedule;
      
      // Handle normal daytime slots (e.g., 09:00 to 17:00)
      if (from <= to) {
        return currentTimeStr >= from && currentTimeStr <= to;
      } 
      // Handle overnight slots (e.g., 22:00 to 02:00)
      else {
        return currentTimeStr >= from || currentTimeStr <= to;
      }
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      radiusKm,
      doctors,
    });
  } catch (error) {
    console.error("Get Nearby Doctors Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while finding nearby doctors." });
  }
};

// ── Create Emergency Booking ─────────────────────────────────────
// Route: POST /api/patient/emergency/book
export const createEmergencyBooking = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, emergency_reason } = req.body;

    if (!doctorId || !emergency_reason) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and emergency reason are required.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.is_verified) {
      return res.status(404).json({ success: false, message: "Doctor not found or not verified." });
    }

    // Today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get the next queue token for this doctor today
    const lastBooking = await Booking.findOne({
      doctorId,
      date: { $gte: today, $lte: todayEnd },
    }).sort({ queue_token_number: -1 });

    const nextToken = lastBooking ? lastBooking.queue_token_number + 1 : 1;

    const booking = await Booking.create({
      patientId,
      doctorId,
      brokerId: doctor.brokerId,
      booking_mode: "Offline",
      date: new Date(),
      time_slot: "EMERGENCY",
      queue_token_number: nextToken,
      is_emergency: true,
      emergency_reason,
      notes: `🚨 EMERGENCY: ${emergency_reason}`,
    });

    // Emit socket notification to broker (populate patient & doctor names for the alert)
    const io = req.app.get("io");
    if (io) {
      const patient = await Patient.findById(patientId).select("name phone");
      const populatedBooking = {
        ...booking.toObject(),
        patientId: patient,
        doctorId: { name: doctor.name, specialization: doctor.specialization },
      };
      io.to(`broker_${doctor.brokerId}`).emit("newBooking", {
        message: `🚨 Emergency booking from ${patient?.name || "a patient"}!`,
        booking: populatedBooking,
      });
    }

    res.status(201).json({
      success: true,
      message: "Emergency booking created! The clinic has been notified.",
      booking,
    });
  } catch (error) {
    console.error("Emergency Booking Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while creating emergency booking." });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 8: PATIENT HEALTH VAULT & REVIEWS
// ═══════════════════════════════════════════════════════════════════

// ── Upload Health Record (supports multiple files) ───────────────
export const uploadHealthRecord = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { title } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: "Record title is required." });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    const newRecords = req.files.map((file, idx) => {
      const file_url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      const recordTitle = req.files.length > 1 ? `${title} (Page ${idx + 1})` : title;
      return { title: recordTitle, file_url };
    });

    patient.health_records.push(...newRecords);
    await patient.save();

    res.status(200).json({
      success: true,
      message: `${newRecords.length} record(s) uploaded successfully.`,
      health_records: patient.health_records,
    });
  } catch (error) {
    console.error("Upload Health Record Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while uploading record." });
  }
};

// ── Get Health Vault ──────────────────────────────────────────────
export const getHealthVault = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await Patient.findById(patientId).select("health_records");
    
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    // Sort by uploaded_at desc
    const records = patient.health_records.sort((a, b) => b.uploaded_at - a.uploaded_at);

    res.status(200).json({
      success: true,
      count: records.length,
      health_records: records,
    });
  } catch (error) {
    console.error("Get Health Vault Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching health records." });
  }
};

// ── Delete Health Record ─────────────────────────────────────────
export const deleteHealthRecord = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { recordId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    const recordIndex = patient.health_records.findIndex(
      (r) => r._id.toString() === recordId
    );

    if (recordIndex === -1) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    patient.health_records.splice(recordIndex, 1);
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Health record removed successfully.",
      health_records: patient.health_records,
    });
  } catch (error) {
    console.error("Delete Health Record Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting record." });
  }
};

// ── Submit Review ─────────────────────────────────────────────────
export const submitReview = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { bookingId } = req.params;
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: "Score must be between 1 and 5." });
    }

    const booking = await Booking.findOne({ _id: bookingId, patientId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    if (booking.status !== "Completed") {
      return res.status(400).json({ success: false, message: "Can only review completed bookings." });
    }

    const doctor = await Doctor.findById(booking.doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });

    const existingReviewIndex = doctor.ratings.findIndex(r => r.patientId.toString() === patientId);

    if (existingReviewIndex !== -1) {
      // Update existing review
      doctor.ratings[existingReviewIndex].score = score;
      doctor.ratings[existingReviewIndex].review = review;
      doctor.ratings[existingReviewIndex].date = new Date();
    } else {
      // Add new review
      doctor.ratings.push({ patientId, score, review, date: new Date() });
    }
    
    // Recalculate average
    const totalScore = doctor.ratings.reduce((acc, curr) => acc + curr.score, 0);
    doctor.average_rating = totalScore / doctor.ratings.length;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Review submitted successfully.",
      average_rating: doctor.average_rating,
    });
  } catch (error) {
    console.error("Submit Review Error:", error.message);
    res.status(500).json({ success: false, message: "Server error while submitting review." });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 9: PATIENT MESSAGES
// ═══════════════════════════════════════════════════════════════════

export const getMyMessages = async (req, res) => {
  try {
    const patientId = req.user.id;
    const messages = await PatientMessage.find({ patientId })
      .populate("doctorId", "name specialization avatar")
      .populate("brokerId", "clinic_name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error("Get My Messages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const message = await PatientMessage.findOneAndDelete({ _id: id, patientId });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    res.status(200).json({ success: true, message: "Message cleared." });
  } catch (error) {
    console.error("Clear Message Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 14: AI MEDICATION ALARMS & PROFILE SETTINGS
// ═══════════════════════════════════════════════════════════════════

export const toggleMedicationAlarm = async (req, res) => {
  try {
    const { alarmId } = req.params;
    const patientId = req.user.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    const alarm = patient.medication_alarms.find(
      (a) => a._id.toString() === alarmId
    );

    if (!alarm) {
      return res.status(404).json({ success: false, message: "Alarm not found." });
    }

    // Toggle isActive
    alarm.isActive = !alarm.isActive;
    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: alarm.isActive ? "Alarm turned on." : "Alarm turned off.",
      medication_alarms: patient.medication_alarms
    });
  } catch (error) {
    console.error("Toggle Alarm Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMedicationAlarmTimes = async (req, res) => {
  try {
    const { alarmId } = req.params;
    const { times } = req.body;
    const patientId = req.user.id;

    if (!Array.isArray(times)) {
       return res.status(400).json({ success: false, message: "Times must be an array of strings." });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    const alarm = patient.medication_alarms.find(
      (a) => a._id.toString() === alarmId
    );

    if (!alarm) {
      return res.status(404).json({ success: false, message: "Alarm not found." });
    }

    alarm.times = times;
    patient.markModified("medication_alarms");
    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: "Alarm times updated successfully.",
      medication_alarms: patient.medication_alarms
    });
  } catch (error) {
    console.error("Update Alarm Times Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadPatientAvatar = async (req, res) => {
  try {
    const patientId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided." });
    }

    const file_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    const patient = await Patient.findByIdAndUpdate(
      patientId, 
      { avatar: file_url }, 
      { new: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      patient
    });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadPatientRingtone = async (req, res) => {
  try {
    const patientId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided." });
    }

    const file_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    const patient = await Patient.findByIdAndUpdate(
      patientId, 
      { custom_ringtone: file_url }, 
      { new: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    res.status(200).json({
      success: true,
      message: "Ringtone updated successfully.",
      patient
    });
  } catch (error) {
    console.error("Upload Ringtone Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePatientRingtone = async (req, res) => {
  try {
    const patientId = req.user.id;
    
    const patient = await Patient.findByIdAndUpdate(
      patientId, 
      { custom_ringtone: "" }, 
      { new: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    res.status(200).json({
      success: true,
      message: "Custom ringtone removed.",
      patient
    });
  } catch (error) {
    console.error("Delete Ringtone Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
