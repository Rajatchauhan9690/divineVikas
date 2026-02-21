import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SeatGrid from "./SeatGrid";

const BookingPage = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  /* Date Restriction: Today + Next 2 Days */

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 2);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  /* Dummy Slot Data */

  const dummySlots = [
    {
      _id: "slot1",
      time: "10:00 AM",
      booked: false,
      seats: Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        booked: i % 7 === 0,
      })),
    },
    {
      _id: "slot2",
      time: "11:00 AM",
      booked: false,
      seats: Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        booked: i % 5 === 0,
      })),
    },
    {
      _id: "slot3",
      time: "12:00 PM",
      booked: true,
      seats: Array.from({ length: 30 }, () => ({
        number: 0,
        booked: true,
      })),
    },
    {
      _id: "slot4",
      time: "01:00 PM",
      booked: false,
      seats: Array.from({ length: 30 }, (_, i) => ({
        number: i + 1,
        booked: i % 4 === 0,
      })),
    },
  ];

  /* Auto Select First Available Slot (NOT Seat) */

  const autoSelectSlot = (slotList) => {
    const availableSlot = slotList.find(
      (slot) => !slot.booked && slot.seats?.some((seat) => !seat.booked),
    );

    if (availableSlot) {
      setSelectedSlot(availableSlot);
    } else {
      setSelectedSlot(null);
    }

    // Always clear seat when date changes
    setSelectedSeat(null);
  };

  useEffect(() => {
    setSlots(dummySlots);
    autoSelectSlot(dummySlots);
  }, []);

  /* Handlers */

  const handleSlotSelect = (slot) => {
    if (slot.booked) return;

    setSelectedSlot(slot);
    setSelectedSeat(null); // reset seat when slot changes
  };

  const handleSeatSelect = (seatNumber) => {
    if (!seatNumber || !selectedSlot) return;

    const seat = selectedSlot.seats?.find(
      (s) => s.number === seatNumber && !s.booked,
    );

    if (seat) setSelectedSeat(seatNumber);
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      toast.error("Please select date");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select slot");
      return;
    }

    if (!selectedSeat) {
      toast.error("Please select seat");
      return;
    }

    toast.success(
      `Booking Confirmed\nDate: ${selectedDate}\nSlot: ${selectedSlot.time}\nSeat: ${selectedSeat}`,
    );

    setTimeout(() => navigate("/checkout"), 500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-white shadow-md rounded-xl p-4 sticky top-4 h-fit">
          <h3 className="text-lg font-bold text-center mb-4">Select Date</h3>

          <input
            type="date"
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => {
              const newDate = e.target.value;
              setSelectedDate(newDate);
              setSlots(dummySlots); // simulate reload
              autoSelectSlot(dummySlots);
            }}
            className="w-full border rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <h3 className="text-lg font-bold text-center mb-4">
            Meditation Slots
          </h3>

          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2">
            {slots.map((slot) => (
              <button
                key={slot._id}
                disabled={slot.booked}
                onClick={() => handleSlotSelect(slot)}
                className={`min-w-[140px] md:w-full border rounded-lg p-3 text-sm transition-all duration-300
                hover:scale-[1.03] hover:shadow-md disabled:opacity-50
                ${
                  selectedSlot?._id === slot._id
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white hover:bg-green-50"
                }`}
              >
                <p className="font-semibold">{slot.time}</p>

                {slot.booked && (
                  <p className="text-red-500 text-xs">Already Booked</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Seat Area */}
        <div className="flex-1 bg-white shadow-md rounded-xl p-4 md:p-6">
          {!selectedSlot ? (
            <div className="h-[400px] flex items-center justify-center text-gray-400 text-lg">
              No available slots
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Select Your Seat</h2>
                <p className="text-gray-500 mt-2">Date: {selectedDate}</p>
                <p className="text-gray-500 mt-1">
                  Slot Time: {selectedSlot.time}
                </p>
              </div>

              <SeatGrid
                seats={selectedSlot?.seats || []}
                selectedSeat={selectedSeat}
                onSeatSelect={handleSeatSelect}
              />

              <div className="text-center mt-10">
                <p className="mb-4 font-semibold text-gray-700">
                  Selected Seat: {selectedSeat || "None"}
                </p>

                <button
                  onClick={handleConfirm}
                  className="bg-green-600 text-white px-8 md:px-10 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 hover:shadow-lg active:scale-95"
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
