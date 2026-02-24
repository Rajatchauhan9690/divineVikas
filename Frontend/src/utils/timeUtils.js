export const parseSessionTime = (timeStr) => {
  if (!timeStr) return 0;

  let [time, modifier] = timeStr.split(" ");
  let [hour = "0", minute = "0"] = time.split(":");

  hour = Number(hour);
  minute = Number(minute);

  if (modifier?.toUpperCase() === "AM" && hour === 12) hour = 0;
  if (modifier?.toUpperCase() === "PM" && hour !== 12) hour += 12;

  return hour * 60 + minute;
};
