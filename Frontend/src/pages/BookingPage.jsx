import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import SeatGrid from "../components/booking/SeatGrid";
import { getSessionsApi, lockSeatApi } from "../api/api";
import socket from "../socket/socket"; // ✅ NEW: Import our socket instance

import { getDateLimits, getTodayDate } from "../utils/dateUtils";
import { parseSessionTime } from "../utils/timeUtils";

const BookingPage = () => {
  const navigate = useNavigate();

  const { minDate, maxDate } = getDateLimits();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getSessionsApi();

      const filtered = response
        .filter(
          (s) => new Date(s.date).toISOString().split("T")[0] === selectedDate,
        )
        .sort((a, b) => parseSessionTime(a.time) - parseSessionTime(b.time));

      setSessions(filtered);

      // If we already have a selected session, update its data to reflect live seat changes
      if (selectedSession) {
        const updatedCurrentSession = filtered.find(
          (s) => s._id === selectedSession._id,
        );
        if (updatedCurrentSession) setSelectedSession(updatedCurrentSession);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSession]); // ✅ Added selectedSession to dependencies

  useEffect(() => {
    loadSessions();
  }, [selectedDate]); // ✅ Removed loadSessions from here to prevent infinite loops, rely on date change

  // Set initial session when loading a new date
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0]);
    } else if (sessions.length === 0) {
      setSelectedSession(null);
    }
  }, [sessions]);

  // ✅ NEW: The Real-Time Socket Listener
  useEffect(() => {
    if (!selectedSession) return;

    console.log(`📡 Joining live room for session: ${selectedSession.name}`);

    // Tell the backend we are looking at this specific session
    socket.emit("join-session", selectedSession._id);

    // Listen for the broadcast that a seat was locked/booked
    const handleSeatUpdate = (updatedSessionId) => {
      if (updatedSessionId === selectedSession._id) {
        console.log("🔄 Live seat update received! Refreshing grid...");
        loadSessions(); // Re-fetch the data to paint the grid with new locks
      }
    };

    socket.on("seat-updated", handleSeatUpdate);

    // Cleanup: Stop listening if the user switches sessions or leaves the page
    return () => {
      socket.off("seat-updated", handleSeatUpdate);
    };
  }, [selectedSession?._id]); // Only re-run if the session ID changes

  const handleSeatSelect = (seatNumber) => {
    if (!selectedSession) return;
    setSelectedSeat(seatNumber);
  };

  const handleConfirm = async () => {
    try {
      if (bookingLoading) return;

      if (!selectedSession) {
        toast.error("Select session");
        return;
      }

      if (!selectedSeat) {
        toast.error("Select seat");
        return;
      }

      setBookingLoading(true);

      const res = await lockSeatApi({
        sessionId: selectedSession._id,
        seatNumber: selectedSeat,
      });

      if (!res.success) {
        toast.error(res.message || "Seat already taken");
        // Force a refresh if they tried to click a ghost seat
        loadSessions();
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

  return (
    <div className="w-full max-w-7xl mx-auto py-4 md:py-10 px-3 md:px-6 overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-6 h-full w-full">
        {/* Date & Slot Sidebar */}
        <div className="w-full md:w-72 bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl p-4 h-[23vh] md:h-auto max-h-[calc(100vh-90px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
          <h3 className="text-lg font-bold text-center mb-3">Select Date</h3>

          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSession(null); // Reset session when date changes
              setSelectedSeat(null);
            }}
            className="w-full border rounded-lg p-2 mb-4"
          />

          <h3 className="text-lg font-bold text-center mb-3">
            Meditation Slots
          </h3>

          <div className="flex md:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2">
            {loading && sessions.length === 0 ? (
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
                  onClick={() => {
                    setSelectedSession(session);
                    setSelectedSeat(null);
                  }}
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

        {/* Seat Grid Area */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] p-4 max-h-[calc(100vh-90px)] overflow-y-auto overflow-x-hidden hide-scrollbar">
          {!selectedSession ? (
            <div className="h-[500px] flex items-center justify-center text-gray-400 text-sm">
              Select a date and slot to view seats
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
                Select Your Seat
              </h2>
              <p className="text-center text-gray-600 mb-4">
                Price per seat: ₹{selectedSession?.pricePerSeat}
              </p>

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
                  {bookingLoading ? "Locking Seat..." : "Confirm Booking"}
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
