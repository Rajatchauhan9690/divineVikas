import express from "express";
import {
  createSession,
  deleteSession,
  getAllBookings,
  getSessions,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/session", createSession);
router.delete("/session/:id", deleteSession);
router.get("/bookings", getAllBookings);
router.get("/sessions", getSessions);

export default router;
