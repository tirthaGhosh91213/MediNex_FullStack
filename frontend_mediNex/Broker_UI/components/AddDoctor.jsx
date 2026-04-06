import React, { useState } from "react";

const AddDoctor = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [degrees, setDegrees] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    registrationNumber: "",
    clinicName: "",
    clinicAddress: "",
    mbbsCollege: "",
    mbbsYear: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setImagePreview(null);
    document.getElementById("doctorImageInput").value = null;
  };

  // Add new higher degree
  const addHigherDegree = () => {
    setDegrees((prev) => [
      ...prev,
      {
        id: Date.now(),
        degree: "",
        college: "",
        year: "",
      },
    ]);
  };

  // Remove higher degree by id
  const removeHigherDegree = (id) => {
    setDegrees((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDegreeChange = (id, field, value) => {
    setDegrees((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              [field]: value,
            }
          : d
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      degrees, // array of higher degrees, empty if none added
      image: imagePreview,
    };
    console.log(payload);
    // Call your API: POST /api/doctors with payload
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Register New Doctor</h2>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Image upload */}
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                  Photo
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Upload Doctor Image
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                  Choose Image
                  <input
                    type="file"
                    id="doctorImageInput"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Dr. Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Specialty, experience, registration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Specialty</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Cardiologist"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Years of Experience</label>
              <input
                type="number"
                min="0"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. DEL/12345"
              />
            </div>
          </div>

          {/* Address & clinic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Clinic / Hospital Name
              </label>
              <input
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="City General Hospital"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Clinic / Hospital Address
              </label>
              <input
                type="text"
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="45, Park Street, Kolkata"
              />
            </div>
          </div>

          {/* MBBS always shown */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Education</h3>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">MBBS Degree</label>
                <input
                  type="text"
                  value="MBBS"
                  readOnly
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">MBBS College</label>
                <input
                  type="text"
                  name="mbbsCollege"
                  value={formData.mbbsCollege}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Medical College Kolkata"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">MBBS Year Passed</label>
                <input
                  type="number"
                  min="1950"
                  max="2026"
                  name="mbbsYear"
                  value={formData.mbbsYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="2010"
                />
              </div>
            </div>

            {/* Dynamic higher degrees */}
            {degrees.map((degree) => (
              <div
                key={degree.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end"
              >
                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Higher Degree
                  </label>
                  <input
                    type="text"
                    value={degree.degree}
                    onChange={(e) =>
                      handleDegreeChange(degree.id, "degree", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. MD (Medicine)"
                  />
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-semibold text-slate-700">College</label>
                  <input
                    type="text"
                    value={degree.college}
                    onChange={(e) =>
                      handleDegreeChange(degree.id, "college", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="AIIMS New Delhi"
                  />
                </div>

                <div className="space-y-2 col-span-1">
                  <label className="text-sm font-semibold text-slate-700">Year Passed</label>
                  <input
                    type="number"
                    min="1950"
                    max="2026"
                    value={degree.year}
                    onChange={(e) =>
                      handleDegreeChange(degree.id, "year", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="2015"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => removeHigherDegree(degree.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add higher degree button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={addHigherDegree}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                + Add Higher Degree
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              About Doctor (Short Bio)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="e.g. Experienced cardiologist with 12+ years in interventional cardiology..."
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              Register Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;