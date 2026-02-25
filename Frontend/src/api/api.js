import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

/* =====================================================
   BOOKING APIs
===================================================== */

// Book seat
export const bookSeatApi = async (data) => {
  const res = await API.post("/api/bookings/create", data);
  return res.data;
};

// Cancel booking
export const cancelBookingApi = async (bookingId) => {
  const res = await API.delete(`/api/bookings/cancel/${bookingId}`);
  return res.data;
};

// Lock seat
export const lockSeatApi = async (data) => {
  const res = await API.post("/api/bookings/lock-seat", data);
  return res.data;
};

// Unlock seat
export const unlockSeatApi = async (data) => {
  const res = await API.post("/api/bookings/unlock-seat", data);
  return res.data;
};

// Get all bookings
export const getAllBookingsApi = async () => {
  const res = await API.get("/api/bookings/booking");
  return res.data;
};

/* =====================================================
   PAYMENT APIs
===================================================== */

// Create payment
export const createPaymentApi = async (data) => {
  const res = await API.post("/api/payment/create", data);
  return res.data;
};

/* =====================================================
   SESSION APIs
===================================================== */

// Create session
export const createSessionApi = async (data) => {
  const res = await API.post("/api/session/create", data);
  return res.data;
};

// Delete session
export const deleteSessionApi = async (id) => {
  const res = await API.delete(`/api/session/delete/${id}`);
  return res.data;
};

// Get sessions
export const getSessionsApi = async () => {
  const res = await API.get("/api/session/get");
  return res.data;
};

// Get single session
export const getSingleSessionApi = async (id) => {
  const res = await API.get(`/api/session/get-single/${id}`);
  return res.data;
};

export default API;
