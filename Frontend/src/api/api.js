import axios from "axios";

/**
 * Axios Instance
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

/* =====================================================
   BOOKING APIs
===================================================== */

/**
 * Lock seat
 */
export const lockSeatApi = async (data) => {
  const res = await API.post("/api/bookings/lock-seat", data);
  return res.data;
};

/**
 * Unlock seat
 */
export const unlockSeatApi = async (data) => {
  const res = await API.post("/api/bookings/unlock-seat", data);
  return res.data;
};

/**
 * Create booking
 */
export const createBookingApi = async (data) => {
  const res = await API.post("/api/bookings/create-booking", data);
  return res.data;
};

/**
 * Confirm booking (after payment success)
 */
export const confirmBookingApi = async (data) => {
  const res = await API.post("/api/bookings/confirm-booking", data);
  return res.data;
};

/**
 * Cancel booking
 */
export const cancelBookingApi = async (bookingId) => {
  const res = await API.post(`/api/bookings/cancel-booking/${bookingId}`);
  return res.data;
};

/**
 * Get all bookings
 */
export const getAllBookingsApi = async () => {
  const res = await API.get("/api/bookings/get-all-bookings");
  return res.data;
};

/**
 * Get booking by id
 */
export const getBookingApi = async (bookingId) => {
  const res = await API.get(`/api/bookings/${bookingId}`);
  return res.data;
};
/* =====================================================
   PAYMENT APIs
===================================================== */

/**
 * Create payment order
 */
export const createPaymentApi = async (data) => {
  const res = await API.post("/api/payment/create-payment", data);
  return res.data;
};

/**
 * Verify payment
 */
export const verifyPaymentApi = async (data) => {
  const res = await API.post("/api/payment/verify-payment", data);
  return res.data;
};

/* =====================================================
   SESSION APIs
===================================================== */

/**
 * Create session
 */
export const createSessionApi = async (data) => {
  const res = await API.post("/api/session/create-session", data);
  return res.data;
};

/**
 * Delete session
 */
export const deleteSessionApi = async (id) => {
  const res = await API.delete(`/api/session/delete-session/${id}`);
  return res.data;
};

/**
 * Get all sessions
 */
export const getSessionsApi = async () => {
  const res = await API.get("/api/session/get-all-session");
  return res.data;
};

export default API;
