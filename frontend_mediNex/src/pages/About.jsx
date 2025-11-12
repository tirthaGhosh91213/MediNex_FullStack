import React from "react";
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
  return (
    <div className="bg-gradient-to-tr from-blue-50 via-white to-blue-100 min-h-screen flex flex-col items-center px-4 py-12">
      {/* About Us Section */}
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-20 mb-12 relative">
        {/* Left: Animated Text */}
        <div className="flex-1 z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-8 animate-fade-in-down">
            About <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text animate-pulse">US</span>
          </h2>
          <p className="text-lg text-gray-700 mb-6 animate-fade-in">
            Welcome to our medical community! We unite skilled doctors, caring staff, and digital convenience to help you feel your best.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <span className="inline-block px-5 py-2 bg-blue-200 text-blue-700 font-semibold rounded-full shadow hover:scale-105 transition-transform animate-bounce">Trusted by thousands</span>
            <span className="inline-block px-5 py-2 bg-white bg-opacity-60 backdrop-blur text-indigo-700 font-semibold rounded-full border border-blue-100 shadow hover:scale-105 transition-transform animate-pulse">24/7 Support</span>
          </div>
        </div>
        {/* Right: Image With Layered Effects */}
        <div className="flex-1 flex justify-center items-center relative animate-float">
          <div className="absolute -z-10 w-64 h-64 bg-blue-100 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          <img
            src={assets.doctor_group}
            alt="Doctor team"
            className="w-72 h-72 object-cover rounded-2xl shadow-xl border-4 border-white transition-transform hover:scale-105 animate-fade-in"
          />
        </div>
      </div>
      {/* Extra info cards (e.g. mission/vision/stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-12">
        <div className="bg-white/80 border border-blue-100 p-6 rounded-2xl shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 animate-slide-in-up">
          <h3 className="font-bold text-blue-700 text-xl mb-2">Our Mission</h3>
          <p className="text-gray-600">Providing accessible, empathetic care powered by technology and compassion.</p>
        </div>
        <div className="bg-white/80 border border-blue-100 p-6 rounded-2xl shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 animate-slide-in-up delay-100">
          <h3 className="font-bold text-blue-700 text-xl mb-2">Our Values</h3>
          <p className="text-gray-600">Authenticity, professional ethics, and commitment to patient wellbeing.</p>
        </div>
        <div className="bg-white/80 border border-blue-100 p-6 rounded-2xl shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 animate-slide-in-up delay-200">
          <h3 className="font-bold text-blue-700 text-xl mb-2">Our Vision</h3>
          <p className="text-gray-600">Empowering healthier communities through innovative care for all ages.</p>
        </div>
      </div>
      {/* Why Choose Us Section */}
      <div className="w-full max-w-4xl mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-blue-700 mb-8 animate-fade-in-down">
          WHY <span className="bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text animate-pulse">CHOOSE US</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
          {features.map((item, idx) => (
            <div
              key={item.title}
              className={`flex flex-col items-center bg-white/90 border border-blue-200 rounded-2xl p-6 w-72 shadow-xl transition-transform hover:-translate-y-2 hover:scale-105 animate-pop-in delay-${idx * 100}`}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="w-14 h-14 mb-4 animate-bounce"
              />
              <h3 className="font-bold text-lg text-blue-700 mb-1">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Animations via Tailwind (extend with keyframes below in your Tailwind config) */}
      {/* suggestions: fade-in, bounce, pop-in, float, slide-in-up */}
      {/* For glassmorphism, use bg-white/60 + backdrop-blur + border. */}
    </div>
  );
};

export default About;
