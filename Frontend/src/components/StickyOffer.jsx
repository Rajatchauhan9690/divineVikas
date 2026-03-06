import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";

export default function StickyOffer() {
  const [showBar, setShowBar] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setShowBar(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          {/* The Glass Pill */}
          <div className="glass-panel pointer-events-auto rounded-full px-6 py-3 flex flex-col md:flex-row items-center gap-4 md:gap-8 shadow-2xl border border-white/60">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider line-through">
                  ₹1499
                </span>
                <span className="text-2xl font-black text-orange-600 leading-none">
                  ₹149
                </span>
              </div>
              <div className="h-10 w-px bg-slate-300/50 hidden md:block"></div>
              <div className="flex items-center gap-2 text-slate-700 bg-white/50 px-3 py-1.5 rounded-full border border-white/40">
                <Timer size={16} className="text-orange-500 animate-pulse" />
                <span className="font-bold text-sm">
                  {minutes}:{seconds}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/booking")}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 text-sm md:text-base whitespace-nowrap"
            >
              Book Healing Session
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
