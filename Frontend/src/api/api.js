import axios from "axios";

/**
 * Axios Instance
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Automatically attach the token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================================================
   ADMIN APIs
===================================================== */

/**
 * Admin Login
 */
export const adminLoginApi = async (data) => {
  const res = await API.post("/api/admin/login", data);
  if (res.data.token) {
    localStorage.setItem("adminToken", res.data.token);
    // Attach token to future requests for this session
    API.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  }
  return res.data;
};

/**
 * Admin Logout
 */
export const adminLogoutApi = async () => {
  const res = await API.post("/api/admin/logout");
  localStorage.removeItem("adminToken");
  delete API.defaults.headers.common["Authorization"];
  return res.data;
};

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
 * Get all bookings (Protected)
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
 * Create session (Protected)
 */
export const createSessionApi = async (data) => {
  const res = await API.post("/api/session/create-session", data);
  return res.data;
};

/**
 * Delete session (Protected)
 */
export const deleteSessionApi = async (id) => {
  const res = await API.delete(`/api/session/delete-session/${id}`);
  return res.data;
};

/**
 * Get all sessions (Public)
 */
export const getSessionsApi = async () => {
  const res = await API.get("/api/session/get-all-session");
  return res.data;
};

export default API;
