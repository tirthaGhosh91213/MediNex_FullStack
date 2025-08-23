import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SpecialityMenu = () => {
  return (
    <div
      id="book"
      className="py-16 px-6 bg-gradient-to-b from-blue-50 via-white to-blue-100"
    >
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Find by <span className="text-blue-600">Speciality</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Choose from our wide range of medical specialities and book your
          appointment with the right doctor.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {specialityData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              to={`/doctors/${item.specialty}`}
              className="flex flex-col items-center bg-white shadow-md rounded-2xl p-6 hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 border border-gray-100 group"
            >
              {/* If you have icons/images inside `specialityData`, render them here */}
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.specialty}
                  className="w-14 h-14 mb-4 group-hover:scale-110 transition-transform duration-300"
                />
              )}
              <p className="text-gray-700 font-semibold text-lg group-hover:text-blue-600 transition-colors">
                {item.specialty}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
