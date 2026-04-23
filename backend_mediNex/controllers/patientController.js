import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Booking from "../models/bookingModel.js";

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

// ═══════════════════════════════════════════════════════════════════
//  PHASE 3: SEARCH & FILTER DOCTORS
// ═══════════════════════════════════════════════════════════════════

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
        select: "name clinic_name clinic_address clinic_location phone",
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

    // ── Step 2: Auto-extract brokerId from the doctor ───────────
    // The doctor document already contains brokerId (set when broker added the doctor)
    const brokerId = doctor.brokerId;

    // ── Step 2b: Prevent duplicate booking ──────────────────────
    // Same patient, same doctor, same date, same time slot
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      patientId,
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time_slot,
      status: { $nin: ["Cancelled"] }, // allow re-booking if previous was cancelled
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have a booking with this doctor at this time slot.",
      });
    }

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

      queue_token_number = existingCount + 1;
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
      // status defaults to "Pending" in the schema
    });

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
//  PHASE 8: PATIENT HEALTH VAULT & REVIEWS
// ═══════════════════════════════════════════════════════════════════

// ── Upload Health Record ──────────────────────────────────────────
export const uploadHealthRecord = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: "Record title is required." });
    }

    const file_url = req.file.path; // Cloudinary URL

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    patient.health_records.push({ title, file_url });
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Health record uploaded successfully.",
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

    // Check if review already exists for this booking/patient (optional logic: update if exists or append a new one in the array?)
    // Here we just add to ratings array.

    doctor.ratings.push({ patientId, score, review });
    
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
