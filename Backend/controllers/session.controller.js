import Session from "../models/session.model.js";
import { cleanupExpiredLocks } from "../utils/lock.util.js";

export const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      ...req.body,
      date: new Date(req.body.date),
    });
    console.log("Session Created Successfully:", session);
    res.status(201).json(session);
  } catch (error) {
    console.log("Create Session Error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();

    res.json(sessions);
  } catch (error) {
    console.log("Get Sessions Error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteSession = async (req, res) => {
  try {
    console.log("Delete Session Request Params:", req.params);

    await Session.findByIdAndDelete(req.params.id);
    console.log("Session Deleted:", deletedSession);
    res.json({
      message: "Session deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
