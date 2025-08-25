import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const TopDoctor = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  return (
    <div className="py-16 px-6 bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Top Doctors to <span className="text-blue-600">Book</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Simply browse through our extensive list of trusted doctors and book your
          appointment instantly.
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
        {doctors.slice(0, 10).map((item, idx) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/appointments/${item._id}`)}
            className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            {/* Doctor Image */}
            <div className="relative w-full h-60 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full shadow-md">
                Available
              </span>
            </div>

            {/* Doctor Info */}
            <div className="p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{item.speciality}</p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-medium shadow hover:bg-blue-700 transition">
                Book Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* More Button */}
      <div className="text-center mt-12">
        <motion.button
        onClick={()=>{navigate('/doctors');scrollTo(0,0)}}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full shadow-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition"
        >
          View More Doctors →
        </motion.button>
      </div>
    </div>
  );
};

export default TopDoctor;
