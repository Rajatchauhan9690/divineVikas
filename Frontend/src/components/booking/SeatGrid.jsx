import Seat from "./Seat";

const SeatGrid = ({
  totalSeats = 0,
  bookedSeats = [],
  lockedSeats = [],
  selectedSeat,
  onSeatSelect,
}) => {
  // Sacred Geometry Layout Math (Fermat's Spiral)
  const getFermatCoordinates = (index, total) => {
    const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio
    const radiusMap = Math.sqrt(index + 0.5) / Math.sqrt(total);
    const maxRadius = 45; // Leave 5% padding on edges
    const r = radiusMap * maxRadius;
    const theta = (2 * Math.PI * index) / (PHI * PHI);

    // Convert polar to cartesian (centered at 50%, 50%)
    const x = 50 + r * Math.cos(theta);
    const y = 50 + r * Math.sin(theta);
    return { x, y };
  };

  const seats = Array.from({ length: totalSeats }, (_, i) => {
    const seatNumber = i + 1;
    const coords = getFermatCoordinates(i, totalSeats);

    return {
      number: seatNumber,
      booked: bookedSeats?.includes(seatNumber),
      locked: lockedSeats?.some((s) => s.seatNumber === seatNumber),
      x: coords.x,
      y: coords.y,
    };
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-10 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent rounded-full blur-3xl -z-10"></div>

      {/* The Circular Container */}
      <div className="relative w-full aspect-square border-2 border-dashed border-slate-200 rounded-full shadow-inner bg-slate-50">
        {/* Center Focal Point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 blur-lg opacity-50 z-0"></div>

        {seats.map((seat) => (
          <div
            key={seat.number}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{
              left: `${seat.x}%`,
              top: `${seat.y}%`,
              // Scale down slightly if there are a massive number of seats to prevent overlap
              width: totalSeats > 30 ? "35px" : "45px",
              height: totalSeats > 30 ? "35px" : "45px",
            }}
          >
            <Seat
              seat={seat}
              isSelected={selectedSeat === seat.number}
              onSeatSelect={onSeatSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
