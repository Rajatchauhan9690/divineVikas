import express from "express";
import {
  createSession,
  deleteSession,
  getSessions,
  getSingleSession,
} from "../controllers/session.controller.js";

const router = express.Router();

/*
================================
SESSION ADMIN ROUTES
================================
*/

router.post("/create", createSession);
router.delete("/delete/:id", deleteSession);

router.get("/get", getSessions);
router.get("/get-single/:id", getSingleSession);

export default router;
