import mongoose from "mongoose";

/**
 * Admin Schema
 * -----------
 * Platform super-admins who manage brokers, doctors, and overall platform settings.
 * - Only admins can approve broker registrations (broker.is_approved)
 * - Only admins can verify doctors (doctor.is_verified)
 */
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // auto-adds createdAt & updatedAt
  }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
