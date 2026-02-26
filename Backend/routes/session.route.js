import express from "express";
import {
  createSession,
  deleteSession,
  getSessions,
  getSingleSession,
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.delete("/delete-session/:id", deleteSession);

router.get("/get-all-session", getSessions);
router.get("/get-single-session/:id", getSingleSession);

export default router;
