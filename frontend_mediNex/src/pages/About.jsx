import React from "react";
import { motion } from "framer-motion";
import { Target, Heart, Eye, ShieldCheck, Clock } from "lucide-react";
import { assets } from "../assets/assets";

const features = [
  {
    title: "Experienced Doctors",
    desc: "Our physicians have 10+ years of medical experience.",
    icon: assets.icon_experience,
  },
  {
    title: "Fast Online Booking",
    desc: "Book appointments in seconds using our optimized platform.",
    icon: assets.icon_booking,
  },
  {
    title: "Patient-Centered Care",
    desc: "Dedicated care for every patient with personalized followup.",
    icon: assets.icon_care,
  },
];

const About = () => {
  // Animation configurations (matches Contact page)
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-16 sm:py-24">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 max-w-2xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          About <span className="text-blue-600">Us</span>
        </h2>
        <div className="h-1.5 w-20 mx-auto rounded-full bg-blue-600 mb-6"></div>
        <p className="text-lg text-slate-600">
          We unite skilled doctors, caring staff, and digital convenience to help you feel your best.
        </p>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-20"
      >
        {/* Left: Text & Badges */}
        <div className="flex-1 w-full order-2 md:order-1">
          <motion.h3 variants={fadeUpVariant} className="text-3xl font-bold text-slate-800 mb-6 leading-tight">
            Committed to your health and well-being.
          </motion.h3>
          <motion.p variants={fadeUpVariant} className="text-lg text-slate-600 mb-8 leading-relaxed">
            Welcome to our medical community. Our goal is to provide accessible, high-quality healthcare using modern technology without losing the human touch. We believe in building lasting relationships with our patients based on trust and transparency.
          </motion.p>
          
          <motion.div variants={fadeUpVariant} className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
              <ShieldCheck size={18} />
              Trusted by thousands
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 shadow-sm">
              <Clock size={18} className="text-blue-600" />
              24/7 Support
            </div>
          </motion.div>
        </div>

        {/* Right: Image */}
        <motion.div variants={fadeUpVariant} className="flex-1 w-full flex justify-center items-center relative order-1 md:order-2">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-30 transform translate-x-10 translate-y-10"></div>
          <img
            src={assets.doctor_group}
            alt="Doctor team"
            className="relative w-full max-w-md object-cover rounded-3xl shadow-2xl border-8 border-white z-10"
          />
        </motion.div>
      </motion.div>

      {/* Core Values (Mission, Vision, Values) */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-24"
      >
        {/* Mission */}
        <motion.div variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <Target size={28} />
          </div>
          <h3 className="font-bold text-slate-900 text-xl mb-3">Our Mission</h3>
          <p className="text-slate-600 leading-relaxed">Providing accessible, empathetic care powered by modern technology and genuine compassion.</p>
        </motion.div>

        {/* Values */}
        <motion.div variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <Heart size={28} />
          </div>
          <h3 className="font-bold text-slate-900 text-xl mb-3">Our Values</h3>
          <p className="text-slate-600 leading-relaxed">Authenticity, uncompromising professional ethics, and a steadfast commitment to patient wellbeing.</p>
        </motion.div>

        {/* Vision */}
        <motion.div variants={fadeUpVariant} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <Eye size={28} />
          </div>
          <h3 className="font-bold text-slate-900 text-xl mb-3">Our Vision</h3>
          <p className="text-slate-600 leading-relaxed">Empowering healthier communities through innovative, comprehensive care for patients of all ages.</p>
        </motion.div>
      </motion.div>

      {/* Why Choose Us Section */}
      <div className="w-full max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why <span className="text-blue-600">Choose Us</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We blend expertise with convenience to deliver a seamless healthcare experience.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((item, idx) => (
            <motion.div
              key={item.title}
              variants={fadeUpVariant}
              className="flex flex-col items-center text-center bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="p-4 bg-slate-50 rounded-full mb-6">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
};

export default About;