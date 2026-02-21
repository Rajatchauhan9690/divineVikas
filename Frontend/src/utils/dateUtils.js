/* ---------- Format Local Date ---------- */

export const formatLocalDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};

/* ---------- Get Today Date ---------- */

export const getTodayDate = () => {
  return formatLocalDate(new Date());
};

/* ---------- Get Date Limits (Booking Page) ---------- */

export const getDateLimits = (plusDays = 2) => {
  const today = new Date();
  const max = new Date();

  max.setDate(today.getDate() + plusDays);

  return {
    minDate: formatLocalDate(today),
    maxDate: formatLocalDate(max),
  };
};

/* ---------- Display Date Format (Admin History) ---------- */

export const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
