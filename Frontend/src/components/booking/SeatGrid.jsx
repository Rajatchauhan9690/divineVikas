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
      booked: bookedSeats.includes(seatNumber),
      locked: lockedSeats.some((s) => s.seatNumber === seatNumber),
    };
  });

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-w-4xl mx-auto">
      {seats.map((seat) => (
        <Seat
          key={seat.number}
          seat={seat}
          isSelected={selectedSeat === seat.number}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </div>
  );
};

export default SeatGrid;
