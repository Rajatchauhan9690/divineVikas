import express from "express";
import {
  bookSeat,
  lockSeat,
  unlockSeat,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", bookSeat);
router.post("/lock-seat", lockSeat);
router.post("/unlock-seat", unlockSeat);

export default router;
