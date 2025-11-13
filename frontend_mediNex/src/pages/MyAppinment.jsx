import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: i => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.09, type: "spring", stiffness: 160 }
  }),
};

const imgVariant = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.07, rotate: 2, boxShadow: "0 8px 32px #c7d2fe90" },
};

const btnVariant = {
  initial: { scale: 1 },
  hover: { scale: 1.05, boxShadow: "0 4px 22px #818cf890" },
  tap: { scale: 0.97 },
};

const MyAppinment = () => {
  const { doctors } = useContext(AppContext);
  const [paying, setPaying] = useState(null); 
  const [cancelIdx, setCancelIdx] = useState(null); 

  const handlePay = idx => {
    setPaying(idx);
    setTimeout(() => setPaying(null), 1500);
  };

  const handleCancel = idx => {
    setCancelIdx(idx);
    setTimeout(() => setCancelIdx(null), 1200); 
  };

  return (
    <div className="min-h-screen w-full py-9 px-1 md:px-8 bg-gradient-to-tr from-indigo-50 via-white to-violet-50 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-violet-700 mb-8 text-center">
        My appointments
      </h1>
      <div className="w-full max-w-4xl space-y-8">
        <AnimatePresence>
          {doctors.slice(0, 3).map((item, i) => (
            <motion.div
              key={item._id || i}
              className="flex bg-white/95 rounded-2xl shadow-lg border border-gray-100 p-3 md:p-6 items-center relative cursor-pointer
                        transition-[box-shadow] hover:shadow-indigo-300 hover:bg-indigo-50/60 group"
              custom={i}
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover={{ scale: 1.012, boxShadow: "0 8px 38px #6366f13f", y: -2 }}
            >
              {/* Status Tag */}
              <motion.span
                className="absolute top-2 left-2 bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-bold shadow-sm"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                Confirmed
              </motion.span>

              {/* Image with animated shine */}
              <motion.div
                className="flex-shrink-0 relative"
                variants={imgVariant}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-indigo-100 group-hover:shadow-2xl"
                />
                {/* Shine effect */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full rounded-xl pointer-events-none
                  group-hover:bg-gradient-to-br group-hover:from-white/20 group-hover:to-indigo-200/10"
                  style={{ mixBlendMode: "lighten" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>

              {/* Info */}
              <div className="flex-1 px-4 md:px-8">
                <h2 className="font-bold text-lg md:text-xl text-indigo-700 mb-0.5">{item.name}</h2>
                <p className="text-[15px] text-blue-600 font-medium">{item.specilaty}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-medium">
                  <span>{item.degree}</span>
                  <span>|</span>
                  <span>{item.experience}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-medium">
                  <span className="mr-1">Address:</span>
                  <span>{item.address.line1}, {item.address.line2}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Date & Time:</span> 25 July, 2024 | 8:30 PM
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-col gap-3 min-w-[135px] md:min-w-[145px]">
                <motion.button
                  variants={btnVariant}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className={`py-2 px-3 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow
                              transition group-hover:bg-indigo-600 flex items-center justify-center whitespace-nowrap`}
                  disabled={paying === i}
                  onClick={() => handlePay(i)}
                >
                  {paying === i ? (
                    <>
                      <span className="loader mr-1"></span> Processing...
                    </>
                  ) : (
                    "Pay Online"
                  )}
                </motion.button>
                <motion.button
                  variants={btnVariant}
                  initial="initial"
                  whileHover={{ scale: 1.04, background: "#fee2e2" }}
                  whileTap="tap"
                  className={`py-2 px-3 w-full rounded-lg bg-white border border-gray-300
                                text-gray-700 font-medium shadow
                                hover:bg-red-50 transition-all duration-100 ease-in`}
                  onClick={() => handleCancel(i)}
                  disabled={cancelIdx === i}
                >
                  {cancelIdx === i ? "Cancelling..." : "Cancel appointment"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>
        {`
        .loader {
          border: 2px solid #fff;
          border-left: 2px solid #818cf8;
          border-radius: 50%;
          width: 15px;
          height: 15px;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          vertical-align: middle;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
};

export default MyAppinment;
