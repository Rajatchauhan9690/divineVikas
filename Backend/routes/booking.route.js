import express from "express";
import {
  lockSeat,
  unlockSeat,
  createBooking,
  confirmBooking,
  getAllBookings,
} from "../controllers/booking.controller.js";
import { protectAdmin } from "../middleware/auth.middleware.js"; // ✅ New

const router = express.Router();

// Public Booking Flow
router.post("/lock-seat", lockSeat);
router.post("/unlock-seat", unlockSeat);
router.post("/create-booking", createBooking);
router.post("/confirm-booking", confirmBooking);

// Protected: Admin-only dashboard data
router.get("/get-all-bookings", protectAdmin, getAllBookings);

export default router;
