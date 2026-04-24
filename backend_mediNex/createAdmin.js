import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/adminModel.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Check if admin exists
    const existing = await Admin.findOne({ email: "tirthaghosh321@gmail.com" });
    if (existing) {
        console.log("Admin already exists!");
        process.exit(0);
    }
    
    const admin = new Admin({
      name: "Admin",
      email: "tirthaghosh321@gmail.com",
      password: "$2b$12$2WITWyiweEPNrn0Tof7RSumFUv.GTVRfwSWm1DZhZe2lGvFAUXNw6", // hash for 12345
      phone: "",
    });
    await admin.save();
    console.log("Admin created successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  });
