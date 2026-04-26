import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
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

    const doctor = await Doctor.findById(id).populate({
      path: "brokerId",
      select: "name clinic_name clinic_address clinic_location phone",
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

    // ── Step 1b: Validate against Doctor's Schedule ─────────────
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bookingDayName = days[new Date(date).getDay()];
    
    const scheduleForDay = doctor.schedule.find(s => s.day === bookingDayName);
    if (!scheduleForDay) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${bookingDayName}.`,
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
      // Also check for Online bookings if they share the limit or have their own
      const existingOnlineCount = await Booking.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        booking_mode: "Online",
        status: { $nin: ["Cancelled"] },
      });

      if (existingOnlineCount >= scheduleForDay.max_patients) {
         return res.status(400).json({
          success: false,
          message: "Doctor has reached the maximum limit for online consultations today.",
        });
      }
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
