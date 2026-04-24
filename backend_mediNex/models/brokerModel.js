import mongoose from "mongoose";

/**
 * Broker Schema
 * -------------
 * Brokers are clinic/hospital owners who register on the platform.
 * - Each broker must be approved by an Admin (is_approved = true) before they can operate.
 * - Brokers add doctors under their clinic (Doctor.brokerId → Broker._id).
 * - Clinic location stored as GeoJSON Point for geo-queries (e.g. "find clinics near me").
 *
 * Relationships:
 *   Broker  1 ──► N  Doctor    (a broker can add many doctors)
 *   Broker  1 ──► N  Booking   (bookings reference the broker's clinic)
 */
const brokerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Broker name is required"],
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
      required: [true, "Phone number is required"],
      trim: true,
    },
    clinic_name: {
      type: String,
      required: [true, "Clinic name is required"],
      trim: true,
    },
    trade_license_number: {
      type: String,
      required: [true, "Trade license number is required"],
      unique: true,
      trim: true,
    },
    // GeoJSON Point — enables MongoDB $near / $geoWithin queries
    clinic_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    clinic_address: {
      type: String,
      default: "",
    },
    // Clean location object for frontend Google Maps integration
    // Broker updates this via PUT /api/broker/location
    location: {
      address: { type: String, default: "" },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    avatar: {
      type: String,
      default: "",
    },
    owner_aadhar: {
      type: String,
      required: [true, "Owner Aadhar card image is required"],
    },
    clinic_license: {
      type: String,
      required: [true, "Clinic license document/image is required"],
    },
    // Admin must approve the broker before they can add doctors / accept bookings
    is_approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on clinic_location for geo-spatial queries
brokerSchema.index({ clinic_location: "2dsphere" });

const Broker = mongoose.model("Broker", brokerSchema);
export default Broker;
