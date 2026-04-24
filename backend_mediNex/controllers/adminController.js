import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Broker from "../models/brokerModel.js";
import Doctor from "../models/doctorModel.js";
import Notification from "../models/notificationModel.js";

/**
 * Admin Auth Controller
 * ─────────────────────
 * Handles admin registration and login.
 * JWT payload includes { id, role: "admin" } so middleware can enforce role-based access.
 */

// ── Register Admin ──────────────────────────────────────────────
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists.",
      });
    }

    // 3. Hash password (salt rounds = 12 for strong security)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create admin document
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
    });

    // 5. Generate JWT (valid for 7 days)
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Respond (never return the password hash)
    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ── Login Admin ─────────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // 2. Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Compare password with stored hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Respond
    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ── Get Admin Profile (protected) ───────────────────────────────
export const getAdminProfile = async (req, res) => {
  try {
    // req.user.id is set by verifyToken middleware
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: BROKER APPROVAL WORKFLOW
// ═══════════════════════════════════════════════════════════════════

// ── Get All Pending Brokers (is_approved = false) ───────────────
// Route: GET /api/admin/brokers/pending
// Access: Admin only
export const getPendingBrokers = async (req, res) => {
  try {
    // Fetch all brokers that haven't been approved yet
    // Exclude password from the response for security
    const pendingBrokers = await Broker.find({ is_approved: false })
      .select("-password")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      count: pendingBrokers.length,
      brokers: pendingBrokers,
    });
  } catch (error) {
    console.error("Get Pending Brokers Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending brokers.",
    });
  }
};

// ── Approve a Broker ────────────────────────────────────────────
// Route: PUT /api/admin/brokers/approve/:brokerId
// Access: Admin only
// Effect: Sets is_approved = true, allowing the broker to add doctors
export const approveBroker = async (req, res) => {
  try {
    const { brokerId } = req.params;

    // 1. Find the broker by ID
    const broker = await Broker.findById(brokerId);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker not found.",
      });
    }

    // 2. Check if already approved (idempotent, but inform the admin)
    if (broker.is_approved) {
      return res.status(400).json({
        success: false,
        message: "This broker is already approved.",
      });
    }

    // 3. Approve the broker
    broker.is_approved = true;
    await broker.save();

    res.status(200).json({
      success: true,
      message: `Broker "${broker.name}" (${broker.clinic_name}) has been approved successfully.`,
      broker: {
        id: broker._id,
        name: broker.name,
        clinic_name: broker.clinic_name,
        is_approved: broker.is_approved,
      },
    });
  } catch (error) {
    console.error("Approve Broker Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while approving broker.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PHASE 2: DOCTOR VERIFICATION WORKFLOW
// ═══════════════════════════════════════════════════════════════════

// ── Get All Pending Doctors (is_verified = false) ───────────────
// Route: GET /api/admin/doctors/pending
// Access: Admin only
// Uses .populate() to include the broker's details so admin knows which clinic added them
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ is_verified: false })
      .populate({
        path: "brokerId",
        select: "name clinic_name trade_license_number clinic_address phone email is_approved",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      doctors: pendingDoctors,
    });
  } catch (error) {
    console.error("Get Pending Doctors Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending doctors.",
    });
  }
};

// ── Verify a Doctor ─────────────────────────────────────────────
// Route: PUT /api/admin/doctors/verify/:doctorId
// Access: Admin only
// Effect: Sets is_verified = true, making the doctor visible to patients for bookings
export const verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // 1. Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    // 2. Check if already verified
    if (doctor.is_verified) {
      return res.status(400).json({
        success: false,
        message: "This doctor is already verified.",
      });
    }

    // 3. Verify the doctor
    doctor.is_verified = true;
    await doctor.save();

    // 4. Populate brokerId to get broker info for notification
    await doctor.populate("brokerId");

    // 5. Create notification in database for the broker
    const notificationMessage = `🎉 Dr. ${doctor.name} has been verified and is now live on the platform!`;
    const notification = await Notification.create({
      type: "DOCTOR_APPROVED",
      message: notificationMessage,
      recipientId: doctor.brokerId._id,
      relatedId: doctor._id,
      onModel: "Doctor"
    });

    // 6. Notify the broker via socket (real-time)
    const io = req.app.get("io");
    if (io && doctor.brokerId) {
      io.to(`broker_${doctor.brokerId._id}`).emit("doctorApproved", {
        _id: notification._id,
        type: "DOCTOR_APPROVED",
        message: notificationMessage,
        doctorId: doctor._id,
        doctorName: doctor.name,
        createdAt: notification.createdAt
      });
    }

    res.status(200).json({
      success: true,
      message: `Doctor "${doctor.name}" (${doctor.specialization}) has been verified successfully.`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        is_verified: doctor.is_verified,
      },
    });
  } catch (error) {
    console.error("Verify Doctor Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while verifying doctor.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════

// ── Get Notifications ───────────────────────────────────────────
// Route: GET /api/admin/notifications
// Access: Admin only
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

// ── Clear All Notifications ─────────────────────────────────────
// Route: DELETE /api/admin/notifications/clear
// Access: Admin only
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: "All notifications cleared.",
    });
  } catch (error) {
    console.error("Clear Notifications Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while clearing notifications.",
    });
  }
};
