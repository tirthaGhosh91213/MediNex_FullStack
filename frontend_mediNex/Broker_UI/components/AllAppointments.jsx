import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

const AllAppointments = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Global Appointments List</h2>
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {[1, 2, 3, 4].map((item, idx) => (
        <div key={idx} className={`p-6 flex items-center justify-between ${idx !== 0 ? 'border-t border-slate-100' : ''}`}>
          <div>
            <h4 className="text-lg font-bold text-slate-800">Patient #{item}029</h4>
            <p className="text-sm text-slate-500 font-medium">Dr. Richard James</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar size={14}/> Oct {12 + item}, 2024</span>
              <span className="flex items-center gap-1"><Clock size={14}/> 10:00 AM</span>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-amber-50 text-amber-600 font-semibold rounded-full text-sm">
            Upcoming
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default AllAppointments;