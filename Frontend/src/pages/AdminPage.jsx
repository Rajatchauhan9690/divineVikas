import React, { useEffect, useState, useMemo, useCallback } from "react";

import {
  createSessionApi,
  getSessionsApi,
  deleteSessionApi,
  getAllBookingsApi,
} from "../api/api";

import { ToastContainer, toast } from "react-toastify";
import { getTodayDate, formatDisplayDate } from "../utils/dateUtils";
import useAutoDateSync from "../hooks/useAutoDateSync";
import { parseSessionTime } from "../utils/timeUtils";

/* =========================================================
   ADMIN PAGE (OPTIMIZED VERSION)
========================================================= */

const AdminPage = () => {
  /* ---------------- STATES ---------------- */

  const [activeTab, setActiveTab] = useState("create");
  const [isCreating, setIsCreating] = useState(false);

  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [deleteId, setDeleteId] = useState(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /* Form */
  const [form, setForm] = useState({
    name: "",
    date: getTodayDate(),
    totalSeats: "",
    pricePerSeat: "",
  });

  const [timeValue, setTimeValue] = useState("");
  const [period, setPeriod] = useState("AM");

  /* Filters */
  const [historyFilter, setHistoryFilter] = useState({ from: "", to: "" });
  const [appliedFilter, setAppliedFilter] = useState({ from: "", to: "" });

  const [bookingFilter, setBookingFilter] = useState({ from: "", to: "" });
  const [appliedBookingFilter, setAppliedBookingFilter] = useState({
    from: "",
    to: "",
  });

  /* ---------------- AUTO DATE SYNC ---------------- */

  useAutoDateSync((newDate) => {
    setForm((prev) => ({ ...prev, date: newDate }));
  });

  /* ---------------- DATA LOADERS ---------------- */

  const fetchSlots = useCallback(async () => {
    try {
      const data = await getSessionsApi();
      setSlots(data || []);
    } catch {
      toast.error("Slot fetch failed");
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await getAllBookingsApi();
      console.log("fetched", res);

      setBookings(res || []);
    } catch {
      toast.error("Booking fetch failed");
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([fetchSlots(), fetchBookings()]);
  }, [fetchSlots, fetchBookings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------- FORM HANDLERS ---------------- */

  const handleChange = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  /* ---------------- TIME INPUT HANDLER ---------------- */

  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) value = value.slice(0, 4);

    let hour = value.slice(0, 2);
    let minute = value.slice(2, 4);

    if (value.length === 3) {
      minute = value.slice(2, 3) + "0";
    }

    if (value.length >= 2) hour = hour.padStart(2, "0");
    if (minute.length === 1) minute = minute + "0";

    if (value.length === 4) {
      if (Number(hour) === 0 || Number(hour) > 12) {
        toast.error("Hour must be between 01 and 12");
        return;
      }

      if (Number(minute) > 59) {
        toast.error("Minute must be between 00 and 59");
        return;
      }

      setTimeValue(`${hour}:${minute}`);
      return;
    }

    setTimeValue(value);
  };

  /* ---------------- FORM VALIDATION ---------------- */

  const isFormValid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.date) return false;
    if (!form.totalSeats || Number(form.totalSeats) <= 0) return false;
    if (!form.pricePerSeat || Number(form.pricePerSeat) <= 0) return false;
    if (!timeValue.includes(":")) return false;

    const [hour, minute] = timeValue.split(":");

    if (Number(hour) < 1 || Number(hour) > 12) return false;
    if (Number(minute) < 0 || Number(minute) > 59) return false;

    return true;
  }, [form, timeValue]);

  /* ---------------- DATE RANGE CHECKER ---------------- */

  const getDateRange = useCallback((itemDate, from, to) => {
    const d = new Date(itemDate);

    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;

    return true;
  }, []);

  /* ---------------- CREATE SESSION ---------------- */

  const handleAddSlot = useCallback(async () => {
    if (!isFormValid || isCreating) return;

    setIsCreating(true);

    try {
      const fullTime = `${timeValue} ${period}`;

      const res = await createSessionApi({
        ...form,
        time: fullTime,
        timeValueParsed: parseSessionTime(fullTime),
        totalSeats: Number(form.totalSeats),
        pricePerSeat: Number(form.pricePerSeat),
        bookedSeats: [],
        lockedSeats: [],
      });

      toast.success("Session created successfully");
      console.log("session creation", res);

      await loadData();

      setForm({
        name: "",
        date: getTodayDate(),
        totalSeats: "",
        pricePerSeat: "",
      });

      setTimeValue("");
      setPeriod("AM");
    } catch {
      toast.error("Failed to create session");
    } finally {
      setIsCreating(false);
    }
  }, [form, timeValue, period, isFormValid, isCreating, loadData]);

  /* ---------------- DELETE SESSION ---------------- */

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      await deleteSessionApi(deleteId);

      toast.success("Deleted successfully");

      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  }, [deleteId, loadData]);

  /* ---------------- FILTERS ---------------- */

  const filteredSlots = useMemo(() => {
    const sorted = slots.slice().sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);

      if (dateDiff !== 0) return dateDiff;

      return parseSessionTime(a.time) - parseSessionTime(b.time);
    });

    if (!appliedFilter.from && !appliedFilter.to) {
      return sorted.slice(0, 5);
    }

    return sorted.filter((slot) =>
      getDateRange(slot.date, appliedFilter.from, appliedFilter.to),
    );
  }, [slots, appliedFilter, getDateRange]);

  const filteredBookings = useMemo(() => {
    const sorted = bookings
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!appliedBookingFilter.from && !appliedBookingFilter.to) {
      return sorted.slice(0, 5);
    }

    return sorted.filter((b) =>
      getDateRange(
        b.createdAt,
        appliedBookingFilter.from,
        appliedBookingFilter.to,
      ),
    );
  }, [bookings, appliedBookingFilter, getDateRange]);

  /* ---------------- STATS ---------------- */

  const totalSlots = slots.length;

  const totalSeats = useMemo(() => {
    return slots.reduce((sum, slot) => sum + Number(slot.totalSeats || 0), 0);
  }, [slots]);

  const totalBookedSeats = bookings.length;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-lg p-6 space-y-4">
        <button>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </button>
        {["create", "bookings", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              activeTab === tab ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            {tab === "create"
              ? "Create Session"
              : tab === "bookings"
                ? "All Bookings"
                : "Session History"}
          </button>
        ))}
      </aside>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${
          isMobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 space-y-4 z-50 transform transition-transform duration-300 md:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Admin Panel</h2>

          <button
            className="text-xl"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {["create", "bookings", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              activeTab === tab ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            {tab === "create"
              ? "Create Session"
              : tab === "bookings"
                ? "All Bookings"
                : "Session History"}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-2xl"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {/* Desktop Header */}
        <h1 className="hidden md:block text-3xl font-bold mb-6">Admin Panel</h1>

        {/* ================= CREATE SESSION ================= */}
        {activeTab === "create" && (
          <div className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Create New Session</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Session Name"
                className="border p-3 rounded-lg"
              />

              <input
                type="date"
                name="date"
                value={form.date}
                min={getTodayDate()}
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />

              <div className="flex gap-2">
                <input
                  value={timeValue}
                  onChange={handleTimeChange}
                  placeholder="HH:MM"
                  className="border p-3 rounded-lg w-full"
                />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border p-3 rounded-lg"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>

              <input
                name="totalSeats"
                value={form.totalSeats}
                onChange={handleChange}
                type="number"
                placeholder="Total Seats"
                className="border p-3 rounded-lg"
              />
              <input
                name="pricePerSeat"
                value={form.pricePerSeat}
                onChange={handleChange}
                type="number"
                placeholder="Price Per Seat (₹)"
                className="border p-3 rounded-lg"
              />
            </div>

            <button
              onClick={handleAddSlot}
              disabled={!isFormValid || isCreating}
              className={`px-6 py-3 rounded-lg transition ${
                isFormValid && !isCreating
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isCreating ? "Creating..." : "Create Session"}
            </button>
          </div>
        )}

        {/* ================= BOOKINGS ================= */}
        {activeTab === "bookings" && (
          <div className="space-y-8">
            {/* ================= FILTER SECTION ================= */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Filter Bookings</h2>

              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex flex-col w-full md:w-48">
                  <label className="text-sm mb-1 font-medium">From</label>
                  <input
                    type="date"
                    value={bookingFilter.from}
                    onChange={(e) =>
                      setBookingFilter({
                        ...bookingFilter,
                        from: e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col w-full md:w-48">
                  <label className="text-sm mb-1 font-medium">To</label>
                  <input
                    type="date"
                    value={bookingFilter.to}
                    onChange={(e) =>
                      setBookingFilter({
                        ...bookingFilter,
                        to: e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setAppliedBookingFilter(bookingFilter)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setBookingFilter({ from: "", to: "" });
                      setAppliedBookingFilter({ from: "", to: "" });
                    }}
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <p className="text-gray-500">Total Slots</p>
                <p className="text-3xl font-bold text-blue-600">{totalSlots}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <p className="text-gray-500">Total Booking Seats</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalBookedSeats}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <p className="text-gray-500">Total Seats</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalSeats}
                </p>
              </div>
            </div>

            {/* ================= BOOKING CARDS CONTAINER ================= */}
            <div className="bg-white p-6 rounded-xl shadow">
              {/* 🔹 Dynamic Heading INSIDE the div */}
              <h2 className="text-xl font-semibold mb-6">
                {appliedBookingFilter.from || appliedBookingFilter.to
                  ? `Total Bookings from ${
                      appliedBookingFilter.from
                        ? formatDisplayDate(appliedBookingFilter.from)
                        : "Beginning"
                    } to ${
                      appliedBookingFilter.to
                        ? formatDisplayDate(appliedBookingFilter.to)
                        : "Today"
                    }`
                  : "Bookings History (Latest 5 Bookings)"}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-gray-50 p-6 rounded-xl shadow space-y-2"
                    >
                      <p>
                        <strong>Name :</strong>{" "}
                        {booking.customerName || "Guest User"}
                      </p>

                      <p>
                        <strong>Email :</strong>{" "}
                        {booking.customerEmail || "N/A"}
                      </p>

                      <p>
                        <strong>Phone :</strong>{" "}
                        {booking.customerPhone || "N/A"}
                      </p>

                      <p>
                        <strong>Seat-No :</strong> {booking.seatNumber}
                      </p>

                      <p>
                        <strong>Booking-Date :</strong>{" "}
                        {formatDisplayDate(booking.createdAt)}
                      </p>

                      <p>
                        <strong>Slot-Date :</strong>{" "}
                        {booking.session?.date
                          ? formatDisplayDate(booking.session.date)
                          : "N/A"}
                      </p>

                      <p>
                        <strong>Slot-Time :</strong>{" "}
                        {booking.session?.time || "N/A"}
                      </p>

                      <p>
                        <strong>Session-Organiser-Name :</strong>{" "}
                        {booking.session?.name || "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-2">
                    No bookings found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ================= HISTORY ================= */}
        {activeTab === "history" && (
          <div className="space-y-8">
            {/* ================= FILTER SECTION ================= */}
            <div className="bg-white p-6 rounded-xl shadow">
              {/* 🔹 Main Heading */}
              <h1 className="text-xl font-semibold text-gray-800">
                Filter History
              </h1>

              <div className=" p-4 rounded-lg flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex flex-col w-full md:w-48">
                  <label className="text-sm mb-1 font-medium">From</label>
                  <input
                    type="date"
                    value={historyFilter.from}
                    onChange={(e) =>
                      setHistoryFilter({
                        ...historyFilter,
                        from: e.target.value,
                      })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col w-full md:w-48">
                  <label className="text-sm mb-1 font-medium">To</label>
                  <input
                    type="date"
                    value={historyFilter.to}
                    onChange={(e) =>
                      setHistoryFilter({ ...historyFilter, to: e.target.value })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => setAppliedFilter(historyFilter)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View
                  </button>

                  <button
                    onClick={() => {
                      setHistoryFilter({ from: "", to: "" });
                      setAppliedFilter({ from: "", to: "" });
                    }}
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ================= HISTORY CARDS ================= */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-6">
                {appliedFilter.from || appliedFilter.to
                  ? `Total Sessions from ${
                      appliedFilter.from
                        ? formatDisplayDate(appliedFilter.from)
                        : "Beginning"
                    } to ${
                      appliedFilter.to
                        ? formatDisplayDate(appliedFilter.to)
                        : "Today"
                    }`
                  : "Session History (Latest 5 Sessions)"}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {filteredSlots.length > 0 ? (
                  filteredSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className="bg-green-50 p-6 rounded-xl shadow space-y-2 relative hover:shadow-md transition"
                    >
                      <button
                        onClick={() => setDeleteId(slot._id)}
                        className="absolute top-3 right-3 text-red-600"
                      >
                        ✕
                      </button>

                      <p className="text-lg font-semibold">{slot.name}</p>

                      <p>
                        <strong>Date:</strong> {formatDisplayDate(slot.date)}
                      </p>

                      <p>
                        <strong>Time:</strong> {slot.time}
                      </p>

                      <p>
                        <strong>Total Seats:</strong> {slot.totalSeats}
                      </p>
                      <p>
                        <strong>Price:</strong> ₹{slot.pricePerSeat || 0}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-2">
                    No session history found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl">
            <p>Delete this session?</p>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded mr-3"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminPage;
