import express from "express";
import {
  createSession,
  deleteSession,
  getAllBookings,
  getSessions,
  getSingleSession,
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/session", createSession);
router.delete("/session/:id", deleteSession);
router.get("/sessions", getSessions);
router.get("/session/:id", getSingleSession);
router.get("/bookings", getAllBookings);

export default router;
