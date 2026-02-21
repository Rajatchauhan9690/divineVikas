import Seat from "./Seat";

const SeatGrid = ({ seats = [], selectedSeat, onSeatSelect }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-w-4xl mx-auto">
      {seats.map((seat, index) => (
        <Seat
          key={index}
          seat={seat}
          isSelected={selectedSeat === seat.number}
          onSeatSelect={onSeatSelect}
        />
      ))}
    </div>
  );
};

export default SeatGrid;
