import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SeatGrid from "./SeatGrid";
import { adminGetSessionsApi } from "../../api/api";

const BookingPage = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  /* Date Restriction */
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 2);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  /* Fetch sessions from backend */

  const loadSessions = async () => {
    try {
      const data = await adminGetSessionsApi();

      // Filter sessions by selected date
      const filtered = data.filter((session) => session.date === selectedDate);

      setSessions(filtered);

      if (filtered.length > 0) {
        setSelectedSession(filtered[0]);
      } else {
        setSelectedSession(null);
      }

      setSelectedSeat(null);
    } catch (error) {
      toast.error("Failed to load sessions");
    }
  };

  useEffect(() => {
    loadSessions();
  }, [selectedDate]);

  /* Handlers */

  const handleSlotSelect = (session) => {
    setSelectedSession(session);
    setSelectedSeat(null);
  };

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleConfirm = () => {
    if (!selectedSession) return toast.error("Select a slot");
    if (!selectedSeat) return toast.error("Select a seat");
    toast.success("Booking confirmed");
    navigate("/checkout", {
      state: {
        sessionId: selectedSession._id,
        date: selectedDate,
        time: selectedSession.time,
        seatNumber: selectedSeat,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white shadow-[0_0_15px_rgba(0,0,0,0.15)] rounded-xl p-4 sticky top-4 h-fit">
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

          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2">
            {sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => handleSlotSelect(session)}
                className={`min-w-[140px] md:w-full border rounded-lg p-3
                ${
                  selectedSession?._id === session._id
                    ? "bg-green-500 text-white"
                    : "bg-white hover:bg-green-50"
                }`}
              >
                <p className="font-semibold">{session.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Seat Area */}
        <div className="flex-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.15)] rounded-xl p-4 md:p-6">
          {!selectedSession ? (
            <div className="h-[400px] flex items-center justify-center text-gray-400">
              No available slots
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Select Your Seat</h2>
                <p className="text-gray-500 mt-2">Date: {selectedDate}</p>
                <p className="text-gray-500 mt-1">
                  Slot Time: {selectedSession.time}
                </p>
              </div>

              <SeatGrid
                totalSeats={selectedSession.totalSeats}
                bookedSeats={selectedSession.bookedSeats}
                selectedSeat={selectedSeat}
                onSeatSelect={handleSeatSelect}
              />

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
