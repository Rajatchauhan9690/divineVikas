import express from "express";
import {
  cancelBooking,
  lockSeat,
  getAllBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Cancel booking
router.delete("/cancel-booking/:bookingId", cancelBooking);

// Seat lock
router.post("/lock-seat", lockSeat);
router.get("/get-all-booking", getAllBookings);

export default router;
