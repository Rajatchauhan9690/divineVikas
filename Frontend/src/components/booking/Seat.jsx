const Seat = ({ seat, isSelected, onSeatSelect }) => {
  const disabled = seat.booked || seat.locked;

  const handleClick = (e) => {
    e.stopPropagation();

    if (!disabled) {
      onSeatSelect(seat.number);
    }
  };

  let className =
    "aspect-square flex items-center justify-center text-sm rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-md";

  if (seat.booked) {
    className += " bg-gray-300 cursor-not-allowed";
  } else if (seat.locked) {
    className += " bg-yellow-300 cursor-not-allowed";
  } else if (isSelected) {
    className += " bg-green-500 text-white shadow-lg";
  } else {
    className += " hover:bg-green-100";
  }

  return (
    <button disabled={disabled} onClick={handleClick} className={className}>
      {seat.number}
    </button>
  );
};

export default Seat;
