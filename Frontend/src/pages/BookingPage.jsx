import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

import SeatGrid from "../components/booking/SeatGrid";
import { getSessionsApi, lockSeatApi } from "../api/api";
import socket from "../socket/socket";

import { getTodayDate } from "../utils/dateUtils";
import { parseSessionTime } from "../utils/timeUtils";

const BookingPage = () => {
  const navigate = useNavigate();

  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // UX State Machine
  const [step, setStep] = useState(1); // Step 1: Date/Time | Step 2: Seat Grid
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch and intelligently parse sessions
  const loadSessions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const response = await getSessionsApi();
      const today = getTodayDate();

      // Filter out past dates and completely full sessions
      const validSessions = response.filter((s) => {
        const sDate = new Date(s.date).toISOString().split("T")[0];
        const isFutureOrToday = sDate >= today;
        const bookedCount = s.bookedSeats?.length || 0;
        const lockedCount = s.lockedSeats?.length || 0;
        const hasCapacity = bookedCount + lockedCount < s.totalSeats;

        return isFutureOrToday && hasCapacity;
      });

      setAllSessions(validSessions);

      if (isInitial) {
        if (validSessions.length > 0) {
          // Sort by date to find the absolute closest available day
          validSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
          setSelectedDate(
            new Date(validSessions[0].date).toISOString().split("T")[0],
          );
        }
        setIsInitialized(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sessions");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(true);
  }, [loadSessions]);

  // Derived Data: Extract unique available dates for the "Temporal Horizon" Carousel
  const availableDates = useMemo(() => {
    const datesMap = new Map();
    allSessions.forEach((s) => {
      const dStr = new Date(s.date).toISOString().split("T")[0];
      if (!datesMap.has(dStr)) {
        const dObj = new Date(s.date);
        datesMap.set(dStr, {
          raw: dStr,
          dayName: dObj.toLocaleDateString("en-US", { weekday: "short" }),
          dayNum: dObj.toLocaleDateString("en-US", { day: "2-digit" }),
          month: dObj.toLocaleDateString("en-US", { month: "short" }),
        });
      }
    });
    return Array.from(datesMap.values()).sort(
      (a, b) => new Date(a.raw) - new Date(b.raw),
    );
  }, [allSessions]);

  // Derived Data: Sessions for the currently selected date
  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allSessions
      .filter(
        (s) => new Date(s.date).toISOString().split("T")[0] === selectedDate,
      )
      .sort((a, b) => parseSessionTime(a.time) - parseSessionTime(b.time));
  }, [allSessions, selectedDate]);

  // Sockets for Live Availability
  useEffect(() => {
    if (!selectedSession) return;
    socket.emit("join-session", selectedSession._id);
    const handleSeatUpdate = (updatedSessionId) => {
      if (updatedSessionId === selectedSession._id) {
        loadSessions(false);
      }
    };
    socket.on("seat-updated", handleSeatUpdate);
    return () => socket.off("seat-updated", handleSeatUpdate);
  }, [selectedSession?._id, loadSessions]);

  // Actions
  const handleTimeSelect = (session) => {
    setSelectedSession(session);
    setSelectedSeat(null);
    setStep(2); // Triggers the Progressive Disclosure animation
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToTime = () => {
    setStep(1);
    setSelectedSeat(null);
  };

  const handleConfirm = async () => {
    try {
      if (bookingLoading) return;
      if (!selectedSeat) {
        toast.error("Please tap a glowing seat");
        return;
      }

      setBookingLoading(true);

      const res = await lockSeatApi({
        sessionId: selectedSession._id,
        seatNumber: selectedSeat,
      });

      if (!res.success) {
        toast.error(res.message || "Seat already taken by another soul");
        loadSessions(false);
        setSelectedSeat(null);
        return;
      }

      navigate("/checkout", {
        state: {
          sessionId: selectedSession._id,
          seatNumber: selectedSeat,
          slotTime: selectedSession.time,
          organizerName: selectedSession.name,
          amount: selectedSession.pricePerSeat,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  // ---------------- Loading State ----------------
  if (!isInitialized) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center relative z-10 bg-mesh">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-6"
        />
        <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wide animate-pulse">
          Aligning Universal Energies...
        </h2>
      </div>
    );
  }

  // ---------------- Sold Out State ----------------
  if (availableDates.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center relative z-10 bg-mesh px-4">
        <div className="bg-white/60 backdrop-blur-xl p-10 rounded-3xl text-center max-w-lg border border-white shadow-2xl">
          <Sparkles className="w-16 h-16 text-orange-400 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            All Sessions Full
          </h2>
          <p className="text-slate-600">
            The sanctuary is currently at maximum capacity. Please check back
            later for new openings.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full font-bold"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Main UI ----------------
  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 relative selection:bg-orange-500 selection:text-white flex flex-col items-center">
      {/* Background Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-400/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-400/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {/* ================= STEP 1: DATE & TIME SELECTION ================= */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl relative z-10 pt-[5vh] md:pt-[10vh]"
          >
            <div className="text-center mb-12">
              <p className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-3 flex items-center justify-center gap-2">
                <CalendarDays size={16} /> Step 1 of 2
              </p>
              <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-slate-900">
                When would you like to heal?
              </h1>
            </div>

            {/* The Temporal Horizon (Horizontal Dates) */}
            <div className="mb-10">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-2 -mx-2 snap-x">
                {availableDates.map((dateObj) => {
                  const isSelected = selectedDate === dateObj.raw;
                  return (
                    <button
                      key={dateObj.raw}
                      onClick={() => setSelectedDate(dateObj.raw)}
                      className={`relative flex flex-col items-center justify-center min-w-[90px] h-[110px] rounded-3xl transition-all duration-300 snap-center shrink-0 border-2 ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-105"
                          : "bg-white/60 border-white/60 text-slate-600 hover:bg-white hover:border-orange-200 backdrop-blur-md"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-slate-400" : "text-slate-400"}`}
                      >
                        {dateObj.dayName}
                      </span>
                      <span
                        className={`text-3xl font-black mt-1 ${isSelected ? "text-white" : "text-slate-800"}`}
                      >
                        {dateObj.dayNum}
                      </span>
                      <span
                        className={`text-xs font-bold uppercase ${isSelected ? "text-orange-400" : "text-slate-500"}`}
                      >
                        {dateObj.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Living Time Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionsForSelectedDate.map((session) => {
                const total = session.totalSeats;
                const booked =
                  (session.bookedSeats?.length || 0) +
                  (session.lockedSeats?.length || 0);
                const left = total - booked;
                const percentage = (booked / total) * 100;

                let tagText = "Pristine Energy";
                let tagColor =
                  "text-emerald-600 bg-emerald-100 border-emerald-200";
                if (percentage > 80) {
                  tagText = "🔥 Filling Fast";
                  tagColor = "text-rose-600 bg-rose-100 border-rose-200";
                } else if (percentage > 50) {
                  tagText = "High Resonance";
                  tagColor = "text-orange-600 bg-orange-100 border-orange-200";
                }

                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={session._id}
                    onClick={() => handleTimeSelect(session)}
                    className="flex flex-col bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 text-left group hover:border-orange-300 transition-colors"
                  >
                    <div className="flex justify-between items-start w-full mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                          <Clock size={16} className="text-orange-500" /> Time
                          Slot
                        </div>
                        <h3 className="text-3xl font-black text-slate-900">
                          {session.time}
                        </h3>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${tagColor}`}
                      >
                        {tagText}
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between border-t border-slate-200/60 pt-4 mt-auto">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {left} seats remaining
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹{session.pricePerSeat} Energy Exchange
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: SEAT GRID BLOOM ================= */}
        {step === 2 && selectedSession && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl relative z-10 flex flex-col"
          >
            {/* Shrunken Header (The Slide-to-Top Effect) */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 20,
                delay: 0.1,
              }}
              className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-lg rounded-full p-2 flex items-center justify-between mb-8"
            >
              <button
                onClick={handleBackToTime}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-semibold transition-colors text-sm"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-3 px-4">
                <CalendarDays size={16} className="text-orange-500" />
                <span className="font-bold text-slate-800 hidden md:inline">
                  {new Date(selectedSession.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block"></div>
                <Clock size={16} className="text-orange-500" />
                <span className="font-black text-slate-900">
                  {selectedSession.time}
                </span>
              </div>
              <div className="hidden md:block w-[88px]"></div>{" "}
              {/* Spacer to center the text */}
            </motion.div>

            {/* The Seat Grid Bloom */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 20,
                delay: 0.2,
              }}
              className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[40px] shadow-2xl p-6 md:p-12 relative flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-slate-900 mb-2">
                  Claim Your Space
                </h2>
                <p className="text-slate-500 font-medium">
                  Tap a glowing orb to anchor your energy in the sanctuary.
                </p>
              </div>

              <div className="w-full flex-1 flex items-center justify-center">
                <SeatGrid
                  totalSeats={selectedSession.totalSeats}
                  bookedSeats={selectedSession.bookedSeats}
                  lockedSeats={selectedSession.lockedSeats}
                  selectedSeat={selectedSeat}
                  onSeatSelect={setSelectedSeat}
                />
              </div>
            </motion.div>

            {/* Floating Confirmation CTA */}
            <AnimatePresence>
              {selectedSeat && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-slate-900 text-white rounded-3xl p-3 shadow-2xl border border-slate-700 flex items-center justify-between z-50"
                >
                  <div className="pl-4 flex items-center gap-4">
                    <ShieldCheck className="text-emerald-400" size={24} />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Seat Selected
                      </p>
                      <p className="text-xl font-black">No. {selectedSeat}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={bookingLoading}
                    className={`relative overflow-hidden bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
                      bookingLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Proceed ₹{selectedSession.pricePerSeat}</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingPage;
