import React from 'react';
import PatientDashboard from './Patient/PatientDashboard';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
          Find Your <span className="text-blue-600">Perfect Doctor</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Search and book appointments with top-rated doctors across various specialties.
        </p>
      </div>
      
      {/* Reusing PatientDashboard which contains the doctor search UI */}
      <PatientDashboard />
    </div>
  );
};

export default HomePage;
