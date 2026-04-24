import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["NEW_CLINIC", "NEW_DOCTOR", "SYSTEM", "DOCTOR_APPROVED"],
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional: Target recipient (if null, it means it's for all Admins)
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Optional: Reference to the related document
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      enum: ['Broker', 'Doctor'],
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
