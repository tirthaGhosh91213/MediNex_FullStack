import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Navigation, ArrowRight } from 'lucide-react';
import { assets } from '../assets/assets';

const Contact = () => {
  // Animation configurations
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-16 sm:py-24">
      
      {/* Section Heading */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 max-w-2xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Get in <span className="text-blue-600">Touch</span>
        </h2>
        <div className="h-1.5 w-20 mx-auto rounded-full bg-blue-600 mb-6"></div>
        <p className="text-lg text-slate-600">
          We are dedicated to providing you with the best support. Reach out to our office today and we’ll be happy to assist you.
        </p>
      </motion.div>

      {/* Main Content Card */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16 items-center"
      >
        {/* Doctor Image with Float Animation */}
        <motion.div 
          variants={fadeUpVariant}
          className="flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50"></div>
            <img
              src={assets.singleDoctorRemovebg}
              alt="Doctor Professional"
              className="relative w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-md z-10 bg-slate-50"
            />
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Address */}
          <motion.div variants={fadeUpVariant} className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Our Office</h3>
              <p className="text-slate-800 font-medium">Bardhaman, West Bengal, India</p>
              <p className="text-slate-500">PIN - 713407</p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUpVariant} className="h-px w-full bg-slate-100"></motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <motion.div variants={fadeUpVariant} className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Phone</h3>
                <a href="tel:8358267151" className="text-slate-800 font-medium hover:text-blue-600 transition-colors">
                  +91 83582 67151
                </a>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUpVariant} className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Email</h3>
                <a href="mailto:ghoshtirtha1234@gmail.com" className="text-slate-800 font-medium hover:text-blue-600 transition-colors break-all">
                  ghoshtirtha1234@gmail.com
                </a>
              </div>
            </motion.div>
          </div>

          {/* Map Link */}
          <motion.div variants={fadeUpVariant} className="mt-2">
            <a
              href="https://maps.google.com/?q=Bardhaman,West+Bengal+713407"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <Navigation size={16} />
              Open in Google Maps
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full max-w-4xl mt-12"
      >
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
            <p className="text-slate-400">Send us a direct message and we will respond promptly.</p>
          </div>
          
          <a 
            href="mailto:ghoshtirtha1234@gmail.com"
            className="relative z-10 group inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
          >
            Email Us Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>

    </div>
  );
};

export default Contact;