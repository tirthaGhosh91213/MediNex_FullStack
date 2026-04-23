import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Check, X, FileText, Video, Home } from "lucide-react";

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/broker/bookings");
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const { data } = await axios.put(`/broker/bookings/${id}/accept`);
      if (data.success) {
        toast.success("Booking Accepted!");
        fetchBookings();
      }
    } catch (err) {
      toast.error("Failed to accept booking");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-black text-slate-800">Booking Requests</h2>
           <p className="text-slate-500 font-medium">Manage incoming patient appointments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Patient</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Doctor</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Mode</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Slot / Token</th>
                <th className="p-4 font-bold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length > 0 ? bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{b.patientId?.name || "Unknown"}</p>
                    <p className="text-sm text-slate-500">{b.patientId?.phone || "N/A"}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-blue-600">{b.doctorId?.name || "Unknown"}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {b.booking_mode === "Online" ? <Video size={16} className="text-blue-500"/> : <Home size={16} className="text-amber-500"/>}
                      {b.booking_mode}
                    </div>
                  </td>
                  <td className="p-4">
                     <p className="text-sm font-semibold text-slate-700">{b.time_slot}</p>
                     {b.booking_mode === "Offline" && b.queue_token_number > 0 && (
                       <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-xs font-black px-2 py-0.5 rounded border border-amber-200">
                         Token: {b.queue_token_number}
                       </span>
                     )}
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    {b.status === "Pending" ? (
                      <button 
                        onClick={() => handleAccept(b._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl flexitems-center gap-2 transition shadow-sm text-sm"
                      >
                        <Check size={16} className="inline mr-1" /> Accept
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm">
                        {b.status}
                      </span>
                    )}
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition shadow-sm text-sm">
                      <FileText size={16} className="inline mr-1" /> Vault
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">
                     No booking requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingRequests;
