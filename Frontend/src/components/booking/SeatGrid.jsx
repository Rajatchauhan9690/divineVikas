import Seat from "./Seat";

const SeatGrid = ({
  totalSeats = 0,
  bookedSeats = [],
  lockedSeats = [],
  selectedSeat,
  onSeatSelect,
}) => {
  const seats = Array.from({ length: totalSeats }, (_, i) => {
    const seatNumber = i + 1;

    return {
      number: seatNumber,
      booked: bookedSeats?.includes(seatNumber),
      locked: lockedSeats?.some((s) => s.seatNumber === seatNumber),
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 pb-15 md:pb-0">
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
        {seats.map((seat) => (
          <Seat
            key={seat.number}
            seat={seat}
            isSelected={selectedSeat === seat.number}
            onSeatSelect={onSeatSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
