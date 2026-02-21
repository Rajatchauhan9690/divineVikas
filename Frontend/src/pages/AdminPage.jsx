import React, { useEffect, useState, useMemo, useCallback } from "react";

import {
  adminCreateSessionApi,
  adminGetSessionsApi,
  adminDeleteSessionApi,
  adminGetAllBookingsApi,
} from "../api/api";

import { ToastContainer, toast } from "react-toastify";

import { getTodayDate, formatDisplayDate } from "../utils/dateUtils";

import useAutoDateSync from "../hooks/useAutoDateSync";

const AdminPage = () => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [form, setForm] = useState({
    name: "",
    date: getTodayDate(),
    totalSeats: "",
  });

  const [timeValue, setTimeValue] = useState("");
  const [period, setPeriod] = useState("AM");

  const [historyFilter, setHistoryFilter] = useState({
    from: "",
    to: "",
  });

  const [deleteId, setDeleteId] = useState(null);

  /* ⭐ Auto Date Sync */
  useAutoDateSync((newDate) => {
    setForm((prev) => ({
      ...prev,
      date: newDate,
    }));
  });

  /* ---------- Fetch Data ---------- */

  const fetchSlots = useCallback(async () => {
    try {
      const data = await adminGetSessionsApi();
      setSlots(data || []);
    } catch {
      console.error("Slot fetch failed");
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await adminGetAllBookingsApi();
      setBookings(res || []);
    } catch {
      console.error("Booking fetch failed");
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, [fetchSlots, fetchBookings]);

  /* ---------- Form Logic ---------- */

  const isFormValid = useMemo(
    () => form.name && form.date && timeValue && form.totalSeats,
    [form, timeValue],
  );

  const handleChange = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleTimeChange = useCallback((e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 3) value = value.slice(0, 2) + ":" + value.slice(2);

    setTimeValue(value);
  }, []);

  /* ---------- Session Create ---------- */

  const handleAddSlot = useCallback(async () => {
    if (!isFormValid) return toast.error("Please fill all fields");

    try {
      await adminCreateSessionApi({
        ...form,
        time: `${timeValue} ${period}`,
        totalSeats: Number(form.totalSeats),
        bookedSeats: [],
        lockedSeats: [],
      });

      toast.success("Session created successfully");

      setForm({
        name: "",
        date: getTodayDate(),
        totalSeats: "",
      });

      setTimeValue("");
      setPeriod("AM");

      fetchSlots();
    } catch {
      toast.error("Failed to create session");
    }
  }, [form, timeValue, period, isFormValid, fetchSlots]);

  const filteredSlots = useMemo(() => {
    const sorted = [...slots].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    let display = sorted;

    if (historyFilter.from || historyFilter.to) {
      const fromDate = historyFilter.from ? new Date(historyFilter.from) : null;

      const toDate = historyFilter.to ? new Date(historyFilter.to) : null;

      display = sorted.filter((slot) => {
        const slotDate = new Date(slot.date);

        if (fromDate && slotDate < fromDate) return false;
        if (toDate && slotDate > toDate) return false;

        return true;
      });
    }

    return display.slice(0, 5);
  }, [slots, historyFilter]);
  /* ================= RENDER ================= */

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Admin Session Management
      </h1>

      {/* CREATE SESSION FORM */}
      <div className="bg-white shadow-md rounded-xl p-4 md:p-6 mb-10 w-full md:w-[80%] mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Create New Session</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Session Name"
            className="border p-3 rounded-lg w-full"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            min={getTodayDate()}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full"
          />

          <div className="flex gap-2 w-full">
            <input
              value={timeValue}
              onChange={handleTimeChange}
              placeholder="HH:MM"
              className="border p-3 rounded-lg w-full"
              maxLength={5}
            />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <input
            name="totalSeats"
            value={form.totalSeats}
            onChange={handleChange}
            placeholder="Total Seats"
            type="number"
            className="border p-3 rounded-lg w-full"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleAddSlot}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-lg transition w-full md:w-auto ${
              isFormValid
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Create Session
          </button>
        </div>
      </div>

      {/* HISTORY FILTER */}
      <div className="bg-blue-50 p-4 rounded-lg border mb-6 w-full md:w-[80%] mx-auto">
        <h2 className="font-semibold text-blue-700 mb-3">Filter History</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="date"
            value={historyFilter.from}
            onChange={(e) =>
              setHistoryFilter((prev) => ({
                ...prev,
                from: e.target.value,
              }))
            }
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            value={historyFilter.to}
            onChange={(e) =>
              setHistoryFilter((prev) => ({
                ...prev,
                to: e.target.value,
              }))
            }
            className="border p-2 rounded w-full"
          />

          <button
            onClick={() => setHistoryFilter({ from: "", to: "" })}
            className="bg-gray-200 px-4 py-2 rounded w-full md:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {/* SESSION HISTORY */}
      <div className="bg-white shadow-md rounded-xl p-4 md:p-6 w-full md:w-[80%] mx-auto">
        <h2 className="text-xl font-semibold mb-6">
          {historyFilter.from || historyFilter.to
            ? `Session History (${formatDisplayDate(
                historyFilter.from || "Starting Date",
              )} → ${formatDisplayDate(
                historyFilter.to || "Ending Date",
              )} Slots)`
            : "Session History (Latest 5 Default)"}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlots.length > 0 ? (
            filteredSlots.map((slot) => (
              <div
                key={slot._id}
                className="p-4 border rounded-lg bg-green-50 relative"
              >
                <button
                  onClick={() => setDeleteId(slot._id)}
                  className="absolute top-2 right-2 text-red-600"
                >
                  ✕
                </button>

                <p className="font-semibold">{slot.name}</p>
                <p className="text-sm">Date: {formatDisplayDate(slot.date)}</p>
                <p className="text-sm">Time: {slot.time}</p>
                <p className="text-sm">Seats: {slot.totalSeats}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">
              No session history found
            </p>
          )}
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="bg-white shadow-md rounded-xl p-4 md:p-6 w-full md:w-[90%] mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-6">All Bookings</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-xl p-5 shadow hover:shadow-lg transition"
              >
                <p className="text-lg font-semibold mb-2">
                  {booking.userName || "N/A"}
                </p>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Email: {booking.email || "N/A"}</p>
                  <p>Seat No: {booking.seatNumber}</p>

                  <p>
                    Booking Date:{" "}
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>

                  {booking.session && (
                    <>
                      <p>Slot Date: {booking.session.date}</p>
                      <p>Slot Time: {booking.session.time}</p>
                      <p>Session Name: {booking.session.name}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No bookings found</p>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4 w-full max-w-sm">
            <p className="text-lg font-semibold">Delete this session?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>

              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-300 px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminPage;
