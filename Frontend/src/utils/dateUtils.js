/* ---------- Format Local Date ---------- */

export const formatLocalDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0"); // ✅ added back

  return `${y}-${m}-${day}`;
};

/* ---------- Get Today Date ---------- */

export const getTodayDate = () => {
  return formatLocalDate(new Date());
};

/* ---------- Get Date Limits (Booking Page) ---------- */
/* 🚫 Removed future 2 days restriction */

export const getDateLimits = () => {
  return {
    minDate: formatLocalDate(new Date()),
    maxDate: "", // no upper limit
  };
};

/* ---------- Display Date Format (Admin & Booking) ---------- */

export const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
