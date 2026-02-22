import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function StickyOffer() {
  const [showBar, setShowBar] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 10 minutes

  const navigate = useNavigate();

  // Show bar after scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShowBar(true);
      } else {
        setShowBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500
      ${showBar ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="bg-white border-t-6 border-orange-500 rounded-t-2xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-4">
          {/* Price Info */}
          <div className="text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-500">₹149</span>
              <span className="line-through font-semibold text-gray-400 text-lg">
                ₹1499
              </span>
            </div>

            <p className="text-gray-600 text-sm font-bold">
              Offer Expires in{" "}
              <span className="font-bold">
                {minutes} : {seconds}
              </span>
            </p>
          </div>
          <button
            className="bg-orange-500 hover:bg-orange-600 transition text-white px-5 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-semibold shadow-md"
            onClick={() => navigate("/booking")}
          >
            Book My Healing Session
          </button>
        </div>
      </div>
    </div>
  );
}
