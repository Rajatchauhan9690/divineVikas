import Session from "../models/Session.js";
import mongoose from "mongoose";

/* =====================================================
   CREATE SESSION
===================================================== */
export const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET ALL SESSIONS
===================================================== */
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET SINGLE SESSION BY ID
===================================================== */
export const getSingleSession = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
