import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-gray-200 pt-12 pb-6 px-6 md:px-20">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-600 pb-10">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-extrabold text-white">
            Medi<span className="text-blue-400">/Nex</span >
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Your trusted healthcare partner. Book appointments with the best
            doctors at  your convenience.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://www.linkedin.com/in/tirtha-ghosh-098a072ba/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-blue-500 transition"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://github.com/tirthaGhosh91213"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-purple-500 transition"
            >
              <Github className="w-5 h-5 text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-sky-500 transition"
            >
              <Twitter className="w-5 h-5 text-white" />
            </motion.a>
          </div>
        </motion.div>

        {/* Company Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">COMPANY</h2>
          <ul className="space-y-3">
            <li>
              <Link
                onClick={()=>scrollTo(0,0)}
                className="hover:text-blue-400 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-blue-400 transition duration-300"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-blue-400 transition duration-300"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-blue-400 transition duration-300"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            GET IN TOUCH
          </h2>
          <ul className="space-y-3">
            <li className="hover:text-blue-400 transition">
              📞 +91 8348267151
            </li>
            <li className="hover:text-blue-400 transition">
              ✉️ ghoshtirtha1234@gmail.com
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="text-center mt-6"
      >
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Medinex - All Rights Reserved.
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
