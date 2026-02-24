import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

/* =====================================================
   BOOKING APIs
   Base: /api/bookings
===================================================== */

// Book seat
export const bookSeatApi = async (data) => {
  const res = await API.post("/api/bookings", data);
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

/* =====================================================
   PAYMENT APIs
   Base: /api/payment
===================================================== */

// Create payment
export const createPaymentApi = async (data) => {
  const res = await API.post("/api/payment", data);
  return res.data;
};

// Verify payment
export const verifyPaymentApi = async (data) => {
  const res = await API.post("/api/payment/verify", data);
  return res.data;
};

/* =====================================================
   ADMIN APIs
   Base: /api/admin
===================================================== */

// Admin create session
export const adminCreateSessionApi = async (data) => {
  const res = await API.post("/api/admin/session", data);
  return res.data;
};

// Delete session
export const adminDeleteSessionApi = async (id) => {
  const res = await API.delete(`/api/admin/session/${id}`);
  return res.data;
};

// Get admin sessions
export const adminGetSessionsApi = async () => {
  const res = await API.get("/api/admin/sessions");
  return res.data;
};
// Get admin single session
export const adminGetSingleSessionApi = async (id) => {
  const res = await API.get(`/api/admin/session/${id}`);
  return res.data;
};

// Get all bookings (Admin)
export const adminGetAllBookingsApi = async () => {
  const res = await API.get("/api/admin/bookings");
  return res.data;
};
export default API;
