import OTP from "../models/otpModel.js";
import Patient from "../models/patientModel.js";
import Broker from "../models/brokerModel.js";
import Admin from "../models/adminModel.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Check if user exists in any collection
    const patient = await Patient.findOne({ email });
    const broker = await Broker.findOne({ email });
    const admin = await Admin.findOne({ email });

    if (!patient && !broker && !admin) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Clear any existing OTP for this email
    await OTP.deleteMany({ email });
    
    await OTP.create({ email, otp });

    const mailOptions = {
      from: `"MediNex" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "MediNex Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f4f7fa; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">MediNex Password Reset</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset your password. Use the following OTP to proceed. It is valid for 5 minutes.</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Error sending OTP, please check email configurations" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let userUpdated = false;

    const patient = await Patient.findOne({ email });
    if (patient) {
      patient.password = hashedPassword;
      await patient.save();
      userUpdated = true;
    }

    if (!userUpdated) {
      const broker = await Broker.findOne({ email });
      if (broker) {
        broker.password = hashedPassword;
        await broker.save();
        userUpdated = true;
      }
    }

    if (!userUpdated) {
      const admin = await Admin.findOne({ email });
      if (admin) {
        admin.password = hashedPassword;
        await admin.save();
        userUpdated = true;
      }
    }

    if (!userUpdated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await OTP.deleteMany({ email }); // clear OTP
    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};
