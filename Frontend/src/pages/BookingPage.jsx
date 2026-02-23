import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";

import SeatGrid from "../components/booking/SeatGrid";

import {
  adminGetSessionsApi,
  bookSeatApi,
  lockSeatApi,
  unlockSeatApi,
} from "../api/api";

import { getDateLimits, getTodayDate } from "../utils/dateUtils";
import useAutoDateSync from "../hooks/useAutoDateSync";

const BookingPage = () => {
  const navigate = useNavigate();

  const { minDate, maxDate } = getDateLimits();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const lockedSeatRef = useRef(null);
  const lockIntervalRef = useRef(null);

  useAutoDateSync(setSelectedDate);

  /* ---------- Spinner ---------- */

  const Spinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full rounded-full animate-spin"></div>
    </div>
  );

  /* ---------- Seat Skeleton ---------- */

  const SeatSkeleton = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 animate-pulse">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="h-12 md:h-14 bg-gray-200 rounded-lg"
          ></div>
        ))}
      </div>
    );
  };

  /* ---------- Load Sessions ---------- */

  const loadSessions = useCallback(async (dateValue) => {
    try {
      setLoading(true);

      const response = await adminGetSessionsApi();

      const filtered = response
        .filter((s) => s.date === dateValue)
        .sort((a, b) => {
          const parseTime = (timeStr) => {
            if (!timeStr) return 0;

            let [time, modifier] = timeStr.split(" ");
            let [hour, minute = "0"] = time.split(":");

            hour = Number(hour);
            minute = Number(minute);

            if (modifier?.toUpperCase() === "PM" && hour !== 12) {
              hour += 12;
            }

            if (modifier?.toUpperCase() === "AM" && hour === 12) {
              hour = 0;
            }

            return hour * 60 + minute;
          };

          return parseTime(a.time) - parseTime(b.time);
        });

      setSessions(filtered);
      setSelectedSession(filtered[0] || null);

      setSelectedSeat(null);
      lockedSeatRef.current = null;
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(selectedDate);
  }, [selectedDate, loadSessions]);

  /* ---------- Socket Sync ---------- */

  useEffect(() => {
    if (!selectedSession) return;

    const socket = window.socket;
    if (!socket) return;

    socket.emit("joinSession", selectedSession._id);

    const handleSeatUpdate = async () => {
      try {
        const response = await adminGetSessionsApi();
        setSessions(response.filter((s) => s.date === selectedDate));
      } catch {}
    };

    socket.on("seat-updated", handleSeatUpdate);

    return () => socket.off("seat-updated", handleSeatUpdate);
  }, [selectedSession, selectedDate]);

  /* ---------- Lock Refresh ---------- */

  const startLockRefresh = useCallback(() => {
    if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);

    lockIntervalRef.current = setInterval(async () => {
      if (!lockedSeatRef.current || !selectedSession) return;

      try {
        await lockSeatApi({
          sessionId: selectedSession._id,
          seatNumber: lockedSeatRef.current,
        });
      } catch {}
    }, 250000);
  }, [selectedSession]);

  /* ---------- Seat Selection ---------- */

  const handleSeatSelect = useCallback(
    async (seatNumber) => {
      try {
        if (!selectedSession) return;

        if (lockedSeatRef.current && lockedSeatRef.current !== seatNumber) {
          await unlockSeatApi({
            sessionId: selectedSession._id,
            seatNumber: lockedSeatRef.current,
          });
        }

        setSelectedSeat(seatNumber);
        lockedSeatRef.current = seatNumber;

        await lockSeatApi({
          sessionId: selectedSession._id,
          seatNumber,
        });

        startLockRefresh();
      } catch {
        toast.error("Seat lock failed");
        setSelectedSeat(null);
        lockedSeatRef.current = null;
      }
    },
    [selectedSession, startLockRefresh],
  );

  /* ---------- Confirm Booking ---------- */

  const handleConfirm = useCallback(async () => {
    try {
      if (!selectedSession) return toast.error("Select a slot");
      if (!selectedSeat) return toast.error("Select a seat");

      await bookSeatApi({
        sessionId: selectedSession._id,
        seatNumber: selectedSeat,
        userName: "Guest User",
      });

      toast.success("Booking confirmed");

      navigate("/checkout", {
        state: {
          sessionId: selectedSession._id,
          date: selectedDate,
          time: selectedSession.time,
          seatNumber: selectedSeat,
        },
      });
    } catch {
      toast.error("Booking failed");
    }
  }, [selectedSession, selectedSeat, selectedDate, navigate]);

  /* ---------- Render ---------- */

  return (
    <div className="h-screen max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl p-4 h-[28vh] md:h-full overflow-y-auto hide-scrollbar">
          <h3 className="text-lg font-bold text-center mb-4">Select Date</h3>

          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg p-3 mb-6"
          />

          <h3 className="text-lg font-bold text-center mb-4">
            Meditation Slots
          </h3>

          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto hide-scrollbar">
            {loading ? (
              <Spinner />
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`min-w-[140px] md:w-full border rounded-lg p-3 transition ${
                    selectedSession?._id === session._id
                      ? "bg-green-500 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  <p className="font-semibold">{session.time}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl p-4 md:p-6 overflow-y-auto hide-scrollbar">
          {!selectedSession ? (
            <div className="h-[400px] flex items-center justify-center text-gray-400">
              No available slots
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Select Your Seat</h2>
              </div>

              {loading ? (
                <SeatSkeleton />
              ) : (
                <div className="block">
                  <SeatGrid
                    totalSeats={selectedSession.totalSeats}
                    bookedSeats={selectedSession.bookedSeats}
                    lockedSeats={selectedSession.lockedSeats}
                    selectedSeat={selectedSeat}
                    onSeatSelect={handleSeatSelect}
                  />
                </div>
              )}

              <div className="text-center mt-10">
                <p className="mb-4 font-semibold">
                  Selected Seat: {selectedSeat || "None"}
                </p>

                <button
                  onClick={handleConfirm}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
