import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center px-4 py-12">
    {/* Section Heading */}
    <div className="text-center mb-12">
      <h2 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-3">
        Contact <span className="bg-gradient-to-r from-indigo-500 to-cyan-600 text-transparent bg-clip-text">US</span>
      </h2>
      <div className="h-2 w-24 mx-auto rounded bg-gradient-to-r from-indigo-400 to-cyan-500"></div>
      <p className="text-lg text-gray-700 opacity-80 mt-2">
        We’re here to help. Get in touch today!
      </p>
    </div>
    
    {/* Main Content */}
    <div className="w-full max-w-3xl bg-white/70 backdrop-blur-lg border border-blue-100 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-8">
      {/* Doctor Image */}
      <div className="flex-shrink-0">
        <img
          src={assets.singleDoctorRemovebg}
          alt="Doctor Office"
          className="w-40 h-40 object-cover rounded-xl border-4 border-white shadow-lg mx-auto"
        />
      </div>
      {/* Info Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full">
        <div>
          <h3 className="text-lg text-indigo-700 font-bold mb-1">OUR OFFICE</h3>
          <p className="text-gray-600 mb-1">Bardhaman, West Bengal, India</p>
          <p className="text-gray-500 mb-2">PIN - 713407</p>
        </div>
        {/* Phone and Email */}
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-cyan-600">Phone</p>
            <a href="tel:8358267151" className="text-gray-700 font-medium underline hover:text-indigo-500 transition">
              +91 83582 67151
            </a>
          </div>
          <div>
            <p className="font-semibold text-indigo-600 mt-4">Email</p>
            <a href="mailto:ghoshtirtha1234@gmail.com" className="text-gray-700 font-medium underline hover:text-cyan-600 transition">
              ghoshtirtha1234@gmail.com
            </a>
          </div>
        </div>
        {/* Google Maps Link */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <p className="font-semibold text-blue-700">Location</p>
          <a
            href="https://maps.google.com/?q=Bardhaman,West+Bengal+713407"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 underline hover:text-indigo-700 transition"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
    
    {/* Call to Action */}
    <div className="w-full max-w-xl text-center px-6 py-7 rounded-2xl bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-500 shadow-md text-white font-bold text-xl tracking-wide mt-4">
      <span className="mr-2">We’re ready to answer your questions!</span>
      <a 
        href="mailto:ghoshtirtha1234@gmail.com"
        className="ml-3 inline-block text-gray-500 bg-white bg-opacity-20 mt-2.5 px-6 py-2 rounded-full hover:bg-white hover:text-indigo-600 shadow-lg transition font-semibold"
      >
        Email us now
      </a>
    </div>
  </div>
)

export default Contact
