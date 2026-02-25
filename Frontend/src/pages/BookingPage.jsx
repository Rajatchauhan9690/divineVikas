// import { useNavigate } from "react-router-dom";
// import { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";

// import SeatGrid from "../components/booking/SeatGrid";
// import { getSessionsApi, lockSeatApi } from "../api/api";

// import { getDateLimits, getTodayDate } from "../utils/dateUtils";
// import { parseSessionTime } from "../utils/timeUtils";

// const BookingPage = () => {
//   const navigate = useNavigate();

//   const { minDate, maxDate } = getDateLimits();

//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const [selectedDate, setSelectedDate] = useState(getTodayDate());
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [selectedSeat, setSelectedSeat] = useState(null);

//   /*
//   ==============================
//   Load Sessions
//   ==============================
//   */
//   const loadSessions = useCallback(async () => {
//     try {
//       setLoading(true);

//       const response = await getSessionsApi();

//       const filtered = response
//         .filter(
//           (s) => new Date(s.date).toISOString().split("T")[0] === selectedDate,
//         )
//         .sort((a, b) => parseSessionTime(a.time) - parseSessionTime(b.time));

//       setSessions(filtered);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load sessions");
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedDate]);

//   /*
//   ==============================
//   Load Sessions On Date Change
//   ==============================
//   */
//   useEffect(() => {
//     loadSessions();
//   }, [loadSessions]);

//   /*
//   ==============================
//   Default Session
//   ==============================
//   */
//   useEffect(() => {
//     if (sessions.length > 0) {
//       setSelectedSession(sessions[0]);
//     } else {
//       setSelectedSession(null);
//     }
//   }, [sessions]);

//   /*
//   ==============================
//   Seat Select
//   ==============================
//   */
//   const handleSeatSelect = (seatNumber) => {
//     if (!selectedSession) return;

//     setSelectedSeat(seatNumber);
//   };

//   /*
//   ==============================
//   Confirm Booking
//   ==============================
//   */
//   const handleConfirm = async () => {
//     try {
//       if (bookingLoading) return;

//       if (!selectedSession) {
//         toast.error("Select session");
//         return;
//       }

//       if (!selectedSeat) {
//         toast.error("Select seat");
//         return;
//       }

//       setBookingLoading(true);

//       const res = await lockSeatApi({
//         sessionId: selectedSession._id,
//         seatNumber: selectedSeat,
//         userName: "Guest",
//       });

//       console.log("Lock response:", res);

//       if (!res.success) {
//         toast.error(res.message || "Seat already locked");
//         return;
//       }

//       // ✅ bookingId MUST come from backend
//       const bookingId = res.bookingId;

//       if (!bookingId) {
//         toast.error("Booking ID missing");
//         console.log(res);
//         return;
//       }

//       // toast.success("Seat locked successfully");

//       navigate("/checkout", {
//         state: {
//           bookingId,
//           seatNumber: selectedSeat,
//           sessionId: selectedSession._id,
//           amount: 149,
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       toast.error("Booking failed");
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-6xl mx-auto p-4">
//       {/* Date Selection */}
//       <div className="mb-4">
//         <h3 className="text-lg font-bold mb-2">Select Date</h3>

//         <input
//           type="date"
//           value={selectedDate}
//           min={minDate}
//           max={maxDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="border p-2 rounded"
//         />
//       </div>

//       {/* Sessions */}
//       <div className="mb-4">
//         <h3 className="text-lg font-bold mb-2">Sessions</h3>

//         {loading ? (
//           <p>Loading sessions...</p>
//         ) : sessions.length === 0 ? (
//           <p>No sessions available</p>
//         ) : (
//           <div className="flex gap-2 flex-wrap">
//             {sessions.map((session) => (
//               <button
//                 key={session._id}
//                 onClick={() => setSelectedSession(session)}
//                 className={`px-4 py-2 rounded border ${
//                   selectedSession?._id === session._id
//                     ? "bg-green-500 text-white"
//                     : "bg-white"
//                 }`}
//               >
//                 {session.time}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Seat Grid */}
//       <div className="mb-6">
//         {selectedSession ? (
//           <>
//             <h3 className="text-lg font-bold mb-2">Select Seat</h3>

//             <SeatGrid
//               totalSeats={selectedSession.totalSeats}
//               bookedSeats={selectedSession.bookedSeats}
//               lockedSeats={selectedSession.lockedSeats}
//               selectedSeat={selectedSeat}
//               onSeatSelect={handleSeatSelect}
//             />
//           </>
//         ) : (
//           <p>No session selected</p>
//         )}
//       </div>

//       {/* Confirm Button */}
//       <div className="flex justify-center">
//         <button
//           onClick={handleConfirm}
//           disabled={bookingLoading}
//           className={`px-6 py-3 rounded text-white ${
//             bookingLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
//           }`}
//         >
//           {bookingLoading ? "Booking..." : "Confirm Booking"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BookingPage;

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
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
    } else {
      setSelectedSession(null);
    }
  }, [sessions]);

  const handleConfirm = async () => {
    try {
      if (!selectedSession || !selectedSeat) {
        toast.error("Select session and seat");
        return;
      }

      setBookingLoading(true);

      const res = await lockSeatApi({
        sessionId: selectedSession._id,
        seatNumber: selectedSeat,
        userName: "Guest",
      });

      if (!res.success) {
        toast.error(res.message || "Seat already locked");
        return;
      }

      navigate("/checkout", {
        state: {
          bookingId: res.bookingId,
          sessionId: selectedSession._id,
          seatNumber: selectedSeat,
          amount: 149,
        },
      });
    } catch {
      toast.error("Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <h3 className="font-bold mb-2">Select Date</h3>

        <input
          type="date"
          value={selectedDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-bold mb-2">Sessions</h3>

        {loading ? (
          <p>Loading sessions...</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => setSelectedSession(session)}
                className={`px-4 py-2 border rounded ${
                  selectedSession?._id === session._id
                    ? "bg-green-500 text-white"
                    : "bg-white"
                }`}
              >
                {session.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <SeatGrid
          totalSeats={selectedSession.totalSeats}
          bookedSeats={selectedSession.bookedSeats}
          lockedSeats={selectedSession.lockedSeats}
          selectedSeat={selectedSeat}
          onSeatSelect={setSelectedSeat}
        />
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleConfirm}
          disabled={bookingLoading}
          className="bg-green-600 text-white px-6 py-3 rounded"
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
