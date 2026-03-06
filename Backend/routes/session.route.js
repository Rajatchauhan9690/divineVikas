import express from "express";
import {
  createSession,
  deleteSession,
  getSessions,
} from "../controllers/session.controller.js";
import { protectAdmin } from "../middleware/auth.middleware.js"; // ✅ New

const router = express.Router();

// Public: Users need to see what's available
router.get("/get-all-session", getSessions);

// Protected: Only Admin can manage sessions
router.post("/create-session", protectAdmin, createSession);
router.delete("/delete-session/:id", protectAdmin, deleteSession);

export default router;
