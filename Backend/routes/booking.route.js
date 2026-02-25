import express from "express";
import {
  bookSeat,
  cancelBooking,
  lockSeat,
  unlockSeat,
  getAllBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

/*
================================
BOOKING FLOW ROUTES
================================
*/

// Create booking (PENDING state)
router.post("/create", bookSeat);

// Cancel booking
router.delete("/cancel/:bookingId", cancelBooking);

// Seat lock/unlock
router.post("/lock-seat", lockSeat);
router.post("/unlock-seat", unlockSeat);
router.get("/booking", getAllBookings);

export default router;
