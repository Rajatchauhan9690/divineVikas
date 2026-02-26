import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

import SeatGrid from "../components/booking/SeatGrid";
import { getSessionsApi, lockSeatApi } from "../api/api";

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

  /*
  ==============================
  Load Sessions
  ==============================
  */
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  /*
  ==============================
  Load Sessions On Date Change
  ==============================
  */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /*
  ==============================
  Default Session
  ==============================
  */
  useEffect(() => {
    if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
    } else {
      setSelectedSession(null);
    }
  }, [sessions]);

  /*
  ==============================
  Seat Select
  ==============================
  */
  const handleSeatSelect = (seatNumber) => {
    if (!selectedSession) return;

    setSelectedSeat(seatNumber);
  };

  /*
  ==============================
  Confirm Booking
  ==============================
  */
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
        userName: "Guest",
      });

      console.log("Lock response:", res);

      if (!res.success) {
        toast.error(res.message || "Seat already locked");
        return;
      }

      // bookingId MUST come from backend
      const bookingId = res.bookingId;

      if (!bookingId) {
        toast.error("Booking ID missing");
        console.log(res);
        return;
      }

      navigate("/checkout", {
        state: {
          bookingId,
          seatNumber: selectedSeat,
          sessionId: selectedSession._id,
          slotTime: selectedSession.time,
          organizerName: selectedSession.name,
          amount: 149,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Booking failed");
    } finally {
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
