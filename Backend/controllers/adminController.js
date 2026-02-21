import Session from "../models/Session.js";
import Booking from "../models/Booking.js";

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
   GET ALL BOOKINGS
================================ */

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("sessionId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
