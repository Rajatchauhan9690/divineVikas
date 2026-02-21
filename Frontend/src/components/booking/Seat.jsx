const Seat = ({ seat, isSelected, onSeatSelect }) => {
  const disabled = seat.booked || seat.number === 0;

  return (
    <button
      disabled={disabled}
      onClick={() => onSeatSelect(seat.number)}
      className={`aspect-square flex items-center justify-center text-sm rounded-lg border transition-all duration-300
      hover:scale-105 hover:shadow-md
      ${
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : isSelected
            ? "bg-green-500 text-white shadow-lg"
            : "hover:bg-green-100"
      }`}
    >
      {seat.number || "-"}
    </button>
  );
};

export default Seat;
