const Seat = ({ seat, isSelected, onSeatSelect }) => {
  const disabled = seat.booked || seat.locked;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onSeatSelect(seat.number);
    }
  };

  let className =
    "w-full h-full flex items-center justify-center text-xs md:text-sm font-semibold rounded-full border transition-all duration-300";

  if (seat.booked) {
    // Booked/Ghost State
    className +=
      " bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed seat-taken";
  } else if (seat.locked) {
    // Locked (Someone else clicked it) State
    className +=
      " bg-amber-100 text-amber-500 border-amber-300 cursor-not-allowed";
  } else if (isSelected) {
    // The "Ignited" State
    className +=
      " bg-gradient-to-br from-green-400 to-emerald-600 text-white border-transparent seat-selected";
  } else {
    // The "Breathing" Available State
    className +=
      " bg-white text-slate-600 border-emerald-200 hover:border-emerald-500 hover:text-emerald-700 cursor-pointer seat-available shadow-sm";
  }

  return (
    <button disabled={disabled} onClick={handleClick} className={className}>
      {seat.number}
    </button>
  );
};

export default Seat;
