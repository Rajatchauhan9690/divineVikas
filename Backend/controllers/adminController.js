import Session from "../models/session.models.js";
import Booking from "../models/booking.models.js";

/* ===============================
   CREATE SESSION
================================ */

export const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DELETE SESSION
================================ */

export const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ===============================
GET ALL SESSIONS
================================ */

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

/* ===============================
   GET ALL BOOKINGS
================================ */

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("session");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
