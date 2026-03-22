import React from 'react';
import { User, ChevronRight } from 'lucide-react';

const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Richard James", specialty: "General Physician", clients: ["Michael Scott", "Jim Halpert", "Dwight Schrute"] },
  { id: 2, name: "Dr. Emily Larson", specialty: "Gynecologist", clients: ["Pam Beesly", "Angela Martin"] },
];

const AllDoctors = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Doctors & Clients</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {MOCK_DOCTORS.map(doc => (
          <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {doc.name.charAt(4)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{doc.specialty}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Current Clients</p>
                <div className="flex flex-wrap gap-2">
                  {doc.clients.map((client, idx) => (
                    <span key={idx} className="text-sm bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <User size={14} className="text-slate-400"/> {client}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <button className="w-full flex items-center justify-between gap-4 px-5 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition">
                View Profile <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllDoctors;