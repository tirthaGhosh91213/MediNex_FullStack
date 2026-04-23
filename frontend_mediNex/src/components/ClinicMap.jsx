import React, { useMemo } from "react";
import { MapPin, Navigation, ExternalLink, Phone, Clock } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ClinicMap Component
 * ───────────────────
 * Displays a clinic's location on an embedded Google Map (iframe)
 * with a "Get Directions" button that deep-links to Google Maps app.
 *
 * Props:
 *   broker  — { clinic_name, clinic_address, location: { lat, lng, address }, phone }
 *   booking — (optional) booking details to show alongside the map
 *
 * Setup:
 *   Add VITE_GOOGLE_MAPS_API_KEY to your frontend .env file.
 *   The key needs "Maps Embed API" enabled in Google Cloud Console.
 *   If no API key is set, falls back to OpenStreetMap embed.
 */

const ClinicMap = ({ broker, booking = null }) => {
  // ── Safely extract location ───────────────────────────────────
  const lat = broker?.location?.lat || 0;
  const lng = broker?.location?.lng || 0;
  const hasValidLocation = lat !== 0 || lng !== 0;
  const clinicName = broker?.clinic_name || "Clinic";
  const clinicAddress =
    broker?.location?.address || broker?.clinic_address || "";

  // ── Google Maps API Key (from environment) ────────────────────
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // ── Map embed URL ─────────────────────────────────────────────
  // If API key is present → use Google Maps Embed API (richer UI)
  // Otherwise → use OpenStreetMap iframe (free, no key needed)
  const mapUrl = useMemo(() => {
    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    }
    // Fallback to OpenStreetMap (no API key required)
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
  }, [lat, lng, apiKey]);

  // ── Deep Link: Open Google Maps for directions ────────────────
  // On mobile → opens the native Google Maps app
  // On desktop → opens Google Maps in a new tab
  // Routes from user's current location to the clinic's lat/lng
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ── If no valid location, show placeholder ────────────────────
  if (!hasValidLocation) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <MapPin size={32} className="mx-auto text-slate-400 mb-3" />
        <p className="text-slate-600 font-medium">
          Clinic location not set yet
        </p>
        <p className="text-sm text-slate-500 mt-1">
          The clinic hasn't updated their location on the map.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* ── Map Embed ──────────────────────────────────────────── */}
      <div className="relative w-full h-64 md:h-80">
        <iframe
          title={`${clinicName} Location`}
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Clinic name overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">
              {clinicName}
            </span>
          </div>
        </div>
      </div>

      {/* ── Clinic Info + Actions ──────────────────────────────── */}
      <div className="p-5 space-y-4">
        {/* Address */}
        {clinicAddress && (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {clinicAddress}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
          </div>
        )}

        {/* Phone */}
        {broker?.phone && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-slate-400 flex-shrink-0" />
            <a
              href={`tel:${broker.phone}`}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              {broker.phone}
            </a>
          </div>
        )}

        {/* Booking time slot (if booking prop is provided) */}
        {booking?.time_slot && (
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-slate-400 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              <span className="font-medium">Appointment:</span>{" "}
              {new Date(booking.date).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}{" "}
              at {booking.time_slot}
            </p>
          </div>
        )}

        {/* ── Action Buttons ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Get Directions — primary CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetDirections}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            <Navigation size={18} />
            Get Directions
          </motion.button>

          {/* Open in Google Maps — secondary */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition border border-slate-200"
          >
            <ExternalLink size={18} />
            Open in Maps
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClinicMap;
