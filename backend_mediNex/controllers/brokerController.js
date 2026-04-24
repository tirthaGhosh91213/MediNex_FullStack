import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Broker from "../models/brokerModel.js";
import Doctor from "../models/doctorModel.js";
import Notification from "../models/notificationModel.js";

/**
 * Broker Auth Controller
 * ──────────────────────
 * Handles broker registration and login.
 * JWT payload: { id, role: "broker" }
 *
 * Important:
 *   - A newly registered broker has is_approved = false by default.
 *   - The broker cannot add doctors or accept bookings until an admin approves them.
 */

// ── Register Broker ─────────────────────────────────────────────
export const registerBroker = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      clinic_name,
      trade_license_number,
      clinic_location,
      clinic_address,
    } = req.body;

    const aadharFile = req.files?.['aadhar']?.[0];
    const licenseFile = req.files?.['license']?.[0];

    // 1. Validate required fields
    if (!name || !email || !password || !phone || !clinic_name || !trade_license_number) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided: name, email, password, phone, clinic_name, trade_license_number.",
      });
    }

    if (!aadharFile || !licenseFile) {
      return res.status(400).json({
        success: false,
        message: "Aadhar card and Clinic License documents are required.",
      });
    }

    // 2. Check for duplicate email or trade license
    const existingBroker = await Broker.findOne({
      $or: [{ email }, { trade_license_number }],
    });
    if (existingBroker) {
      return res.status(409).json({
        success: false,
        message:
          existingBroker.email === email
            ? "A broker with this email already exists."
            : "This trade license number is already registered.",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Build location object (GeoJSON Point)
    // clinic_location comes as a JSON string from FormData
    let parsedLocation = null;
    try {
      parsedLocation = clinic_location ? JSON.parse(clinic_location) : null;
    } catch (e) {
      parsedLocation = null;
    }

    const locationData = {
      type: "Point",
      coordinates:
        parsedLocation && Array.isArray(parsedLocation.coordinates)
          ? parsedLocation.coordinates
          : [0, 0],
    };

    // 5. Create broker (is_approved defaults to false)
    const broker = await Broker.create({
      name,
      email,
      password: hashedPassword,
      phone,
      clinic_name,
      trade_license_number,
      clinic_location: locationData,
      clinic_address: clinic_address || "",
      owner_aadhar: aadharFile ? `http://localhost:4000/uploads/${aadharFile.filename}` : "",
      clinic_license: licenseFile ? `http://localhost:4000/uploads/${licenseFile.filename}` : "",
    });

    // 6. Generate JWT
    const token = jwt.sign(
      { id: broker._id, role: "broker" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Save Notification to DB & Emit socket event for Admin
    const notification = await Notification.create({
      type: "NEW_CLINIC",
      message: `New clinic registration request from ${clinic_name}.`,
      relatedId: broker._id,
      onModel: 'Broker'
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newAdminNotification", notification);
    }

    // 8. Respond
    res.status(201).json({
      success: true,
      message: "Broker registered successfully. Awaiting admin approval.",
      token,
      broker: {
        id: broker._id,
        name: broker.name,
        email: broker.email,
        clinic_name: broker.clinic_name,
        is_approved: broker.is_approved,
      },
    });
  } catch (error) {
    console.error("Broker Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ── Login Broker ────────────────────────────────────────────────
export const loginBroker = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // 2. Find broker
    const broker = await Broker.findOne({ email });
    if (!broker) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, broker.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: broker._id, role: "broker" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Respond (include approval status so frontend can show pending screen)
    res.status(200).json({
      success: true,
      message: broker.is_approved
        ? "Broker logged in successfully."
        : "Logged in, but your account is pending admin approval.",
      token,
      broker: {
        id: broker._id,
        name: broker.name,
        email: broker.email,
        clinic_name: broker.clinic_name,
        is_approved: broker.is_approved,
      },
    });
  } catch (error) {
    console.error("Broker Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ── Get Broker Profile (protected) ──────────────────────────────
export const getBrokerProfile = async (req, res) => {
  try {
    const broker = await Broker.findById(req.user.id).select("-password");
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found.",
      });
    }

    res.status(200).json({
      success: true,
      broker,
    });
  } catch (error) {
    console.error("Get Broker Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: DOCTOR ONBOARDING (Broker adds doctors to their clinic)
// ═══════════════════════════════════════════════════════════════════

// ── Add a New Doctor ────────────────────────────────────────────
// Route: POST /api/broker/doctors/add
// Access: Broker only (must be approved by admin)
// The new doctor's is_verified defaults to false (requires admin verification)
export const addDoctor = async (req, res) => {
  try {
    // 1. First, verify this broker is approved by admin
    //    req.user.id comes from the JWT (set by verifyToken middleware)
    const broker = await Broker.findById(req.user.id);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker account not found.",
      });
    }

    // CRUCIAL CHECK: Only approved brokers can add doctors
    if (!broker.is_approved) {
      return res.status(403).json({
        success: false,
        message: "Your clinic is not verified by admin yet. You cannot add doctors until approved.",
      });
    }

    // 2. Extract doctor details from request body
    const {
      name,
      email,
      phone,
      specialization,
      degree,
      medical_reg_number,
      experience,
      fees,
      bio,
      schedule,       // JSON string: [{day, from, to, max_patients}]
      max_patients_per_day,
    } = req.body;

    // Handle multiple files: avatar & registration_certificate
    const avatarFile = req.files?.['avatar']?.[0];
    const regCertFile = req.files?.['registration_certificate']?.[0];

    const buildFileUrl = (file) =>
      file ? `http://localhost:4000/uploads/${file.filename}` : "";

    // Parse schedule JSON string from FormData
    let parsedSchedule = [];
    try {
      parsedSchedule = schedule ? JSON.parse(schedule) : [];
    } catch { parsedSchedule = []; }

    // 3. Validate required fields
    if (!name || !email || !specialization || !medical_reg_number || fees === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, email, specialization, medical_reg_number, fees.",
      });
    }

    // 4. Check for duplicate email or medical registration number
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { medical_reg_number }],
    });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message:
          existingDoctor.email === email
            ? "A doctor with this email already exists."
            : "This medical registration number is already registered.",
      });
    }

    // 5. Create the doctor document
    //    - brokerId links this doctor to the broker who added them
    //    - is_verified defaults to false (admin must verify)
    const doctor = await Doctor.create({
      brokerId: broker._id,
      name,
      email,
      phone: phone || "",
      specialization,
      degree: degree || "MBBS",
      medical_reg_number,
      experience: experience || 0,
      fees,
      bio: bio || "",
      avatar: buildFileUrl(avatarFile),
      registration_certificate: buildFileUrl(regCertFile),
      schedule: parsedSchedule,
      max_patients_per_day: max_patients_per_day || 20,
    });

    // 6. Save Notification to DB & Emit socket event for Admin
    const notification = await Notification.create({
      type: "NEW_DOCTOR",
      message: `New doctor ${doctor.name} added by ${broker.clinic_name}. Awaiting verification.`,
      relatedId: doctor._id,
      onModel: 'Doctor'
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("newAdminNotification", notification);
    }

    res.status(201).json({
      success: true,
      message: `Doctor "${doctor.name}" added successfully. Awaiting admin verification.`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        medical_reg_number: doctor.medical_reg_number,
        fees: doctor.fees,
        is_verified: doctor.is_verified,
        brokerId: doctor.brokerId,
      },
    });
  } catch (error) {
    console.error("Add Doctor Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding doctor.",
    });
  }
};

// ── Get All Doctors Added by This Broker ─────────────────────────
// Route: GET /api/broker/doctors
// Access: Broker only
// Returns all doctors linked to the authenticated broker's clinic
export const getBrokerDoctors = async (req, res) => {
  try {
    // Find all doctors whose brokerId matches the logged-in broker
    const doctors = await Doctor.find({ brokerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get Broker Doctors Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 5: CLINIC GEOLOCATION
// ═══════════════════════════════════════════════════════════════════

// ── Update Broker Location ──────────────────────────────────────
// Route: PUT /api/broker/location
// Access: Broker only
// Payload: { address, lat, lng }
// Updates both the clean location object (for frontend) and the GeoJSON
// clinic_location (for server-side geo-queries like $near)
export const updateBrokerLocation = async (req, res) => {
  try {
    const brokerId = req.user.id;
    const { address, lat, lng } = req.body;

    // 1. Validate required fields
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and Longitude (lng) are required.",
      });
    }

    // 2. Validate lat/lng ranges
    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90.",
      });
    }
    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180.",
      });
    }

    // 3. Find the broker
    const broker = await Broker.findById(brokerId);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found.",
      });
    }

    // 4. Update the clean location object (used by frontend / Google Maps)
    broker.location = {
      address: address || broker.location?.address || "",
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    // 5. Also sync the GeoJSON clinic_location (used for MongoDB geo-queries)
    // GeoJSON uses [longitude, latitude] order
    broker.clinic_location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    // 6. Update clinic_address if address is provided
    if (address) {
      broker.clinic_address = address;
    }

    await broker.save();

    res.status(200).json({
      success: true,
      message: "Clinic location updated successfully.",
      location: broker.location,
    });
  } catch (error) {
    console.error("Update Broker Location Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating location.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 8: DOCTOR/BROKER ACCESS TO HEALTH VAULT
// ═══════════════════════════════════════════════════════════════════

// ── Get Patient Records ──────────────────────────────────────────
// Route: GET /api/broker/patient-records/:patientId
// Access: Broker only
// Logic: Checks if there is an active/accepted booking between this broker and the patient
export const getPatientRecords = async (req, res) => {
  try {
    const brokerId = req.user.id;
    const { patientId } = req.params;

    // 1. Verify a booking exists and is active
    const booking = await Booking.findOne({
      brokerId,
      patientId,
      status: { $in: ["Accepted", "In-Progress", "Completed"] }, // Allow if they have "met" 
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have an active booking with this patient.",
      });
    }

    // 2. Fetch the patient's health records
    const patient = await Patient.findById(patientId).select("name health_records");
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    res.status(200).json({
      success: true,
      patientName: patient.name,
      health_records: patient.health_records,
    });
  } catch (error) {
    console.error("Get Patient Records Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching patient records.",
    });
  }
};
// ── Get Broker Notifications ──────────────────────────────────────
// Route: GET /api/broker/notifications
// Access: Broker only
export const getBrokerNotifications = async (req, res) => {
  try {
    const brokerId = req.user.id;
    const notifications = await Notification.find({ recipientId: brokerId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Broker Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

// ── Clear Broker Notifications ───────────────────────────────────
// Route: DELETE /api/broker/notifications/clear
// Access: Broker only
export const clearBrokerNotifications = async (req, res) => {
  try {
    const brokerId = req.user.id;
    await Notification.deleteMany({ recipientId: brokerId });

    res.status(200).json({
      success: true,
      message: "All notifications cleared.",
    });
  } catch (error) {
    console.error("Clear Broker Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while clearing notifications.",
    });
  }
};
