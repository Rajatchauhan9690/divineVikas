import express from "express";
import {
  createSession,
  getSessions,
  getSingleSession, // 👈 add this
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSingleSession); // 👈 NEW ROUTE

export default router;
