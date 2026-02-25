import Session from "../models/session.model.js";
import Booking from "../models/booking.model.js";
import { isLockExpired, cleanupExpiredLocks } from "../utils/lock.util.js";

/*
=====================================
SESSION CONTROLLER
=====================================
*/

export const createSession = async (req, res) => {
  try {
    console.log("🟢 Create Session Request:", req.body);

    const sessionData = {
      ...req.body,
      date: new Date(req.body.date),
    };

    const session = await Session.create(sessionData);

    console.log("✅ Session Created:", session._id);

    res.status(201).json(session);
  } catch (error) {
    console.error("❌ Create Session Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    console.log("🗑 Delete Session:", req.params.id);

    await Session.findByIdAndDelete(req.params.id);

    res.json({ message: "Session deleted" });
  } catch (error) {
    console.error("❌ Delete Session Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    console.log("📌 Fetching sessions");

    const sessions = await Session.find();

    res.json(sessions);
  } catch (error) {
    console.error("❌ Get Sessions Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getSingleSession = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📌 Get Session:", id);

    if (!id) return res.status(400).json({ message: "Session id required" });

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    await cleanupExpiredLocks(session);

    res.json(session);
  } catch (error) {
    console.error("❌ Get Single Session Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


