import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  BadgeCheck,
  Info,
  GraduationCap,
  Briefcase,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";

const Appointments = () => {
  const { docId } = useParams();
  const { doctors,currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots,setDocSlots]=useState([])
  const [slotInx,setSlotIdx]=useState(0)
  const [slotTime,setSlotTime]=useState('')

  useEffect(() => {
    const doc = doctors.find((doc) => doc._id === docId);
    setDocInfo(doc);
  }, [doctors, docId]);

  return (
    docInfo && (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-14 py-8 px-4 md:px-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-xl rounded-xl max-w-3xl w-full overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Doctor Image */}
            <div className="md:w-1/3 flex justify-center items-center bg-blue-50 p-4">
              <motion.img
                src={docInfo.image}
                alt={docInfo.name}
                className="rounded-lg shadow-md w-44 h-44 object-cover border-2 border-white"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Doctor Info */}
            <div className="md:w-2/3 p-5 flex flex-col justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  {docInfo.name}
                  <BadgeCheck className="w-5 h-5 text-blue-500 drop-shadow-sm" />
                </h1>
                <p className="text-sm text-blue-600 font-medium mb-3">
                  Verified Doctor
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    <GraduationCap size={16} /> {docInfo.degree}
                  </span>
                  <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    <Stethoscope size={16} /> {docInfo.specilaty}
                  </span>
                  <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    <Briefcase size={16} /> {docInfo.experience}
                  </span>
                </div>

                {/* About Section */}
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-blue-600" /> About Doctor
                </h2>
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  {docInfo.about}
                </p>
              </div>
                <div>
                  <p>Appointment fee : <span>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
              {/* Book Now Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 self-start bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md font-medium shadow text-sm transition"
              >
                Book Appointment
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  );
};

export default Appointments;
