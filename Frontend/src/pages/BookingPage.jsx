import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import SeatGrid from "../components/booking/SeatGrid";

import { adminGetSessionsApi, bookSeatApi, lockSeatApi } from "../api/api";

import { getDateLimits, getTodayDate } from "../utils/dateUtils";
import {
  setSeatCache,
  getSeatCache,
  clearSeatCache,
} from "../utils/cacheUtils";
import { parseSessionTime } from "../utils/timeUtils";
import useAutoDateSync from "../hooks/useAutoDateSync";

const BookingPage = () => {
  const navigate = useNavigate();

  const { minDate, maxDate } = getDateLimits();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const apiLockRef = useRef(false);
  const confirmLockRef = useRef(false);
  const seatClickLockRef = useRef(false);
  const bookingClickRef = useRef(false);

  useAutoDateSync(setSelectedDate);

  /* ===============================
     Load Sessions
  ================================= */

  const loadSessions = useCallback(async (dateValue, showLoading = true) => {
    try {
      if (apiLockRef.current) return;

      apiLockRef.current = true;

      if (showLoading) setLoading(true);

      const CACHE_VALIDITY = 30000;

      const cache = getSeatCache();

      if (
        cache &&
        cache.date === dateValue &&
        Date.now() - cache.timestamp < CACHE_VALIDITY
      ) {
        setSessions(cache.sessions);
        return;
      }

      const response = await adminGetSessionsApi();

      const filtered = response
        .filter((s) => {
          if (!s.date) return false;
          return new Date(s.date).toISOString().split("T")[0] === dateValue;
        })
        .sort((a, b) => {
          return parseSessionTime(a.time) - parseSessionTime(b.time);
        });

      setSessions(filtered);

      setSeatCache({
        date: dateValue,
        sessions: filtered,
        timestamp: Date.now(),
      });
    } catch {
      toast.error("Failed to load slots");
    } finally {
      apiLockRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, []);

  /* ===============================
     Default Slot Selection
  ================================= */
  /* ===============================
   Default Session Selection
================================ */

  useEffect(() => {
    if (!sessions.length) {
      setSelectedSession(null);
      return;
    }

    setSelectedSession((prev) => {
      if (!prev) return sessions[0];

      return sessions.find((s) => s._id === prev._id) || sessions[0];
    });
  }, [sessions]);

  /* ===============================
   Load Sessions When Date Changes
================================ */

  useEffect(() => {
    loadSessions(selectedDate);
  }, [selectedDate, loadSessions]);

  /* ===============================
   Auto Refresh Session Data
================================ */

  useEffect(() => {
    if (!selectedSession) return;

    const interval = setInterval(() => {
      loadSessions(selectedDate, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSession, selectedDate, loadSessions]);

  /* ===============================
     Socket Listener
  ================================= */

  useEffect(() => {
    if (!selectedSession) return;

    const socket = window.socket;
    if (!socket) return;

    const seatUpdateHandler = (sessionId) => {
      if (sessionId !== selectedSession._id) return;

      clearSeatCache();
      loadSessions(selectedDate, false);
    };

    socket.emit("join-session", selectedSession._id);

    socket.off("seat-updated");
    socket.on("seat-updated", seatUpdateHandler);

    return () => {
      socket.emit("leave-session", selectedSession._id);
      socket.off("seat-updated", seatUpdateHandler);
    };
  }, [selectedSession, selectedDate, loadSessions]);

  /* ===============================
     Seat Selection
  ================================= */

  const handleSeatSelect = async (seatNumber) => {
    try {
      if (!selectedSession) return;

      if (seatClickLockRef.current) return;

      seatClickLockRef.current = true;

      setTimeout(() => {
        seatClickLockRef.current = false;
      }, 300);

      setSelectedSeat(seatNumber);

      await lockSeatApi({
        sessionId: selectedSession._id,
        seatNumber,
      });
    } catch {
      toast.error("Seat lock failed");
      setSelectedSeat(null);
    }
  };

  /* ===============================
     Confirm Booking
  ================================= */

  const handleConfirm = async () => {
    try {
      if (bookingLoading || confirmLockRef.current || bookingClickRef.current) {
        return;
      }

      confirmLockRef.current = true;
      bookingClickRef.current = true;
      setBookingLoading(true);

      if (!selectedSession) {
        toast.error("Select a slot");
        return;
      }

      if (!selectedSeat) {
        toast.error("Select a seat");
        return;
      }

      const response = await bookSeatApi({
        sessionId: selectedSession._id,
        seatNumber: selectedSeat,
        userName: "Guest User",
      });

      if (!response || response.status >= 400) {
        throw new Error("Booking failed");
      }

      toast.success("Booking confirmed");

      /* Optimistic UI Update */
      setSessions((prev) =>
        prev.map((session) =>
          session._id === selectedSession._id
            ? {
                ...session,
                bookedSeats: [...session.bookedSeats, selectedSeat],
                lockedSeats: session.lockedSeats.filter(
                  (seat) => seat.seatNumber !== selectedSeat,
                ),
              }
            : session,
        ),
      );

      clearSeatCache();
      await loadSessions(selectedDate, false);

      navigate("/checkout", {
        state: {
          sessionId: selectedSession._id,
          date: selectedDate,
          time: selectedSession.time,
          seatNumber: selectedSeat,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Booking failed",
      );
    } finally {
      confirmLockRef.current = false;
      bookingClickRef.current = false;
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 md:py-10 px-3 md:px-6 overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-6 h-full w-full">
        <div
          className="w-full md:w-72 bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)]
        rounded-xl p-4 h-[23vh] md:h-auto max-h-[calc(100vh-90px)]
        overflow-y-auto overflow-x-hidden hide-scrollbar"
        >
          <h3 className="text-lg font-bold text-center mb-3">Select Date</h3>

          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <h3 className="text-lg font-bold text-center mb-3">
            Meditation Slots
          </h3>

          <div className="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2">
            {loading ? (
              <div className="w-full h-[50px] md:h-[100px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-gray-400 text-sm p-4 w-full">
                {`There are no slots for ${selectedDate}`}
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`border rounded-lg p-2 transition min-w-[90px] md:w-full text-md ${
                    selectedSession?._id === session._id
                      ? "bg-green-500 text-white"
                      : "bg-white hover:bg-green-50"
                  }`}
                >
                  {session.time}
                </button>
              ))
            )}
          </div>
        </div>

        <div
          className="flex-1 w-full bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)]
        p-4 max-h-[calc(100vh-90px)]
        overflow-y-auto overflow-x-hidden hide-scrollbar"
        >
          {!selectedSession ? (
            <div className="h-[500px] flex items-center justify-center text-gray-400 text-sm">
              No available slots
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
                Select Your Seat
              </h2>

              <SeatGrid
                totalSeats={selectedSession.totalSeats}
                bookedSeats={selectedSession.bookedSeats}
                lockedSeats={selectedSession.lockedSeats}
                selectedSeat={selectedSeat}
                onSeatSelect={handleSeatSelect}
              />

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleConfirm}
                  disabled={bookingLoading}
                  className={`bg-green-600 text-white px-6 py-2 rounded-lg w-full md:w-auto text-sm flex items-center justify-center gap-2 transition ${
                    bookingLoading ? "opacity-50 " : "opacity-100"
                  }`}
                >
                  {bookingLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
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
