import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Star, Loader2, MessageSquareHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RatingModal = ({ isOpen, onClose, booking }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const doctorName = booking.doctorId?.name || "the Doctor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please supply a star rating!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`/patient/review/${booking._id}`, {
        score: rating,
        review
      });
      if (data.success) {
        toast.success("Thank you for your feedback!");
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
           {/* Header Cover */}
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center text-white relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                 <MessageSquareHeart size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black">Consultation Complete!</h2>
              <p className="text-blue-100 text-sm mt-1">How was your experience with {doctorName}?</p>
              <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition bg-white/10 p-1.5 rounded-full">✕</button>
           </div>

           <form onSubmit={handleSubmit} className="p-8">
              
              {/* Star Rating Area */}
              <div className="flex justify-center gap-2 mb-8">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} type="button"
                      onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={40} 
                        className={`transition-colors duration-200 ${
                          (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "fill-slate-100 text-slate-300"
                        }`} 
                      />
                    </button>
                 ))}
              </div>

              {/* Text Area */}
              <div className="mb-6">
                <textarea 
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-700 resize-none"
                  placeholder="Write a brief note about your experience (optional)..."
                  value={review} onChange={(e) => setReview(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center"
              >
                 {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Submit Review"}
              </button>
              
              <button 
                type="button" onClick={onClose}
                className="w-full mt-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
              >
                 Skip for now
              </button>
           </form>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;
