import React from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <div className="min-h-screen flex justify-center items-center  px-4 md:px-4 py-16 bg-gradient-to-r from-blue-100 via-white to-blue-50">
      {/* Glass Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row  items-center justify-between w-full max-w-6xl rounded-3xl bg-white/80 backdrop-blur-lg shadow-2xl border border-gray-200 p-10 md:p-14"
      >
        {/* Left */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 space-y-8  text-center md:text-left"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 leading-snug">
            Book Appointment <br /> with{" "}
            <span className="text-blue-600">Trusted Doctor</span>
          </h1>

          {/* Feature */}
          <div className="flex  items-center gap-4 bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl shadow-md max-w-md mx-auto md:mx-0 border">
            <img
              src={assets.singleDoctorRemovebg}
              alt="doctor icon"
              className="w-12 h-12 animate-bounce"
            />
            <p className="text-gray-600 text-lg font-medium">
              Simply browse through our extensive list of trusted doctors
            </p>
          </div>

          {/* Button */}
          <motion.a
            href="#book"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 transition font-semibold tracking-wide"
          >
            Book Appointment →
          </motion.a>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 mt-10 md:mt-0 flex justify-center"
        >
          <img
            src={assets.doctor_group}
            alt="header doctors"
            className="w-full max-w-md md:max-w-lg drop-shadow-lg hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;
