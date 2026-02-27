import express from "express";
import {
  cancelBooking,
  lockSeat,
  getAllBookings,
  unlockSeat,
  createBooking,
  confirmBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();
router.post("/lock-seat", lockSeat);
router.post("/unlock-seat", unlockSeat);
router.post("/create-booking", createBooking);
router.post("/confirm-booking", confirmBooking);
router.delete("/cancel-booking/:bookingId", cancelBooking);
router.get("/get-all-bookings", getAllBookings);

export default router;
