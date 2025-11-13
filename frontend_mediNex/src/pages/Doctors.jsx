import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";

const norm = (s) => (s ? String(s).trim().toLowerCase() : "");

const Doctors = () => {
  const { specilaty } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { doctors = [] } = useContext(AppContext);

  const applyFilter = () => {
    if (specilaty) {
      const target = norm(specilaty);
      const next = doctors.filter((doc) => {
        const docKey = norm(doc.speciality ?? doc.specilaty);
        return docKey === target;
      });
      setFilterDoc(next);
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, specilaty]);

  const specialties = [
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Endocrinologist",
    "GNF"
  ];

  return (
    <div className="px-6 sm:px-12 md:px-20 py-10 bg-gray-50 min-h-screen">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-3"
      >
        Browse Top Doctors
      </motion.h1>
      <p className="text-center text-gray-600 mb-10">
        Choose from the best specialists and book your appointment instantly.
      </p>

      {/* Filter Button for mobile only */}
      <button
        type="button"
        onClick={() => setShowFilter((prev) => !prev)}
        className="sm:hidden block mb-4 px-5 py-2 rounded-full border font-medium shadow transition bg-white text-blue-600 hover:bg-blue-50"
      >
        {showFilter ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        // On desktop: always show; on mobile: show when showFilter is true
        className={`
          flex flex-wrap justify-center gap-3 mb-12 sticky top-0 z-20 
          backdrop-blur-md bg-white/30 py-3
          ${showFilter ? "block" : "hidden"} 
          sm:flex
        `}
      >
        {/* All */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/doctors")}
          className={`px-5 py-2 rounded-full border font-medium shadow-sm transition-all duration-300 ${
            !specilaty
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white/70 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
          }`}
        >
          All
        </motion.button>
        {/* Map specialties */}
        {specialties.map((speciality) => (
          <motion.button
            key={speciality}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() =>
              norm(specilaty) === norm(speciality)
                ? navigate("/doctors")
                : navigate(`/doctors/${speciality}`)
            }
            className={`px-5 py-2 rounded-full border font-medium shadow-sm transition-all duration-300 ${
              norm(specilaty) === norm(speciality)
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/70 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
            }`}
          >
            {speciality}
          </motion.button>
        ))}
      </motion.div>

      {/* Doctors Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filterDoc.map((item, idx) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.06 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/appointments/${item._id}`)}
            className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
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
            <div className="p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {item.speciality ?? item.specilaty}
              </p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-medium shadow hover:bg-blue-700 transition">
                Book Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {/* No Doctor Found */}
      {filterDoc.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-12 text-lg"
        >
          {specilaty
            ? `No doctors available for "${specilaty}" right now.`
            : "No doctors available right now."}
        </motion.p>
      )}
    </div>
  );
};

export default Doctors;
