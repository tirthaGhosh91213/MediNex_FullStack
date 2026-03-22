import React from 'react';

const AddDoctor = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Register New Doctor</h2>
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <form className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Dr. Jane Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Specialty</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Cardiologist" />
          </div>
        </div>
        <button type="button" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
          Submit Details
        </button>
      </form>
    </div>
  </div>
);

export default AddDoctor;