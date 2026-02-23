import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import SeatGrid from "../components/booking/SeatGrid";

import { adminGetSessionsApi, bookSeatApi, lockSeatApi } from "../api/api";

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

  const apiLockRef = useRef(false);
  const confirmLockRef = useRef(false);

  useAutoDateSync(setSelectedDate);

  /* ===============================
     Load Sessions
  ================================= */

  const loadSessions = useCallback(async (dateValue, showLoading = true) => {
    try {
      if (apiLockRef.current) return;

      apiLockRef.current = true;

      if (showLoading) setLoading(true);

      const response = await adminGetSessionsApi();
      // console.log(response);

      const filtered = response
        .filter((s) => {
          if (!s.date) return false;
          return new Date(s.date).toISOString().split("T")[0] === dateValue;
        })
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
      // console.log(filtered);

      setSelectedSession((prev) => {
        if (!filtered.length) return null;

        if (!prev) return filtered[0];

        const exists = filtered.find((s) => s._id === prev._id);

        return exists ? prev : filtered[0];
      });
    } catch {
      toast.error("Failed to load slots");
    } finally {
      apiLockRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, []);

  /* ===============================
     Effects
  ================================= */

  useEffect(() => {
    loadSessions(selectedDate);
  }, [selectedDate, loadSessions]);

  useEffect(() => {
    if (!selectedSession) return;

    const socket = window.socket;
    if (!socket) return;

    socket.emit("join-session", selectedSession._id);

    const handleSeatUpdate = () => {
      loadSessions(selectedDate, false);
    };

    socket.on("seat-updated", handleSeatUpdate);

    return () => {
      socket.off("seat-updated", handleSeatUpdate);
    };
  }, [selectedSession, loadSessions]);

  /* ===============================
     Seat Selection
  ================================= */

  const handleSeatSelect = async (seatNumber) => {
    try {
      if (!selectedSession) return;

      // 🔥 If user already selected a seat → unlock it first
      if (selectedSeat && selectedSeat !== seatNumber) {
        await lockSeatApi({
          sessionId: selectedSession._id,
          seatNumber: selectedSeat,
          unlock: true, // backend should support this
        });
      }

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
      if (confirmLockRef.current) return;

      confirmLockRef.current = true;

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

      if (!response) throw new Error("Booking failed");

      toast.success("Booking confirmed");

      navigate("/checkout", {
        state: {
          sessionId: selectedSession._id,
          date: selectedDate,
          time: selectedSession.time,
          seatNumber: selectedSeat,
        },
      });
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Booking failed",
      );
    } finally {
      confirmLockRef.current = false;
    }
  };

  /* ===============================
     UI Render
  ================================= */

  return (
    <div className="w-full max-w-7xl mx-auto py-4 md:py-10 px-3 md:px-6 overflow-x-hidden">
      <div className="flex flex-col md:flex-row gap-6 h-full w-full">
        {/* Sidebar */}
        <div
          className="w-full md:w-72 bg-white shadow-lg shadow-[0_0_20px_rgba(0,0,0,0.15)]
        rounded-xl p-4 h-[23vh] md:h-full overflow-y-auto overflow-x-hidden hide-scrollbar"
        >
          <h3 className="text-lg font-bold text-center mb-3 md:mb-4">
            Select Date
          </h3>

          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg p-2 md:p-3 mb-4 md:mb-6 text-sm md:text-base"
          />

          <h3 className="text-lg font-bold text-center mb-3 md:mb-4">
            Meditation Slots
          </h3>

          {/* Slot List */}
          <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto hide-scrollbar pb-2">
            {loading ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`border rounded-lg p-2 md:p-3 transition min-w-[90px] md:w-full text-sm md:text-base ${
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

        {/* Main Section */}
        <div
          className="flex-1 w-full bg-white rounded-xl  shadow-[0_0_20px_rgba(0,0,0,0.15)]
        p-4 md:p-6 h-[75vh] md:h-auto overflow-y-auto overflow-x-hidden pb-22 md:pb-6"
        >
          {!selectedSession ? (
            <div className="h-[300px] md:h-[400px] flex items-center justify-center text-gray-400 text-sm md:text-base">
              No available slots
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
                Select Your Seat
              </h2>

              <SeatGrid
                totalSeats={selectedSession.totalSeats}
                bookedSeats={selectedSession.bookedSeats}
                lockedSeats={selectedSession.lockedSeats}
                selectedSeat={selectedSeat}
                onSeatSelect={handleSeatSelect}
              />

              {/* Bottom Confirm Section */}
              <div className="fixed bottom-0 left-4 right-4 bg-white p-4 shadow-lg md:static md:shadow-none text-center z-50">
                <p className="mb-2 md:mb-3 font-semibold text-sm md:text-base">
                  Selected Seat: {selectedSeat || "None"}
                </p>

                <button
                  onClick={handleConfirm}
                  className="bg-green-600 text-white px-6 py-2 md:px-8 md:py-3 
                rounded-lg w-full md:w-auto text-sm md:text-base"
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
