import { FixedSizeGrid as Grid } from "react-window";
import Seat from "./Seat";

const SeatGrid = ({
  totalSeats = 0,
  bookedSeats = [],
  lockedSeats = [],
  selectedSeat,
  onSeatSelect,
}) => {
  const columns = 12; // adjust for desktop layout

  const rows = Math.ceil(totalSeats / columns);

  const seatMap = new Map();

  bookedSeats.forEach((seat) => seatMap.set(seat, "booked"));

  lockedSeats.forEach((seat) => seatMap.set(seat.seatNumber, "locked"));

  return (
    <div className="flex justify-center">
      <Grid
        columnCount={columns}
        rowCount={rows}
        columnWidth={70}
        rowHeight={70}
        height={600}
        width={900}
      >
        {({ columnIndex, rowIndex, style }) => {
          const seatNumber = rowIndex * columns + columnIndex + 1;

          if (seatNumber > totalSeats) return null;

          const status = seatMap.get(seatNumber);

          const seat = {
            number: seatNumber,
            booked: status === "booked",
            locked: status === "locked",
          };

          return (
            <div style={style} className="flex justify-center items-center">
              <Seat
                seat={seat}
                isSelected={selectedSeat === seatNumber}
                onSeatSelect={onSeatSelect}
              />
            </div>
          );
        }}
      </Grid>
    </div>
  );
};

export default SeatGrid;
