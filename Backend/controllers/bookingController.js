import Session from "../models/Session.js";
import Booking from "../models/Booking.js";
/* ===============================
   BOOK SEAT (FINAL CONFIRMATION)
================================ */

export const bookSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, userName } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if seat already booked
    if (session.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Remove from locked seats
    session.lockedSeats = session.lockedSeats.filter(
      (seat) => seat.seatNumber !== seatNumber,
    );

    // Add to booked seats
    session.bookedSeats.push(seatNumber);

    await session.save();

    // Create booking record
    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      userName,
    });

    res.status(201).json({
      message: "Seat booked successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ===============================
   LOCK SEAT
================================ */

export const lockSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if already booked
    if (session.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    // Check if already locked
    const alreadyLocked = session.lockedSeats.find(
      (seat) => seat.seatNumber === seatNumber,
    );

    if (alreadyLocked) {
      return res.status(400).json({ message: "Seat already locked" });
    }

    session.lockedSeats.push({ seatNumber });
    await session.save();

    res.json({ message: "Seat locked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   UNLOCK SEAT
================================ */

export const unlockSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber } = req.body;

    const session = await Session.findById(sessionId);

    session.lockedSeats = session.lockedSeats.filter(
      (seat) => seat.seatNumber !== seatNumber,
    );

    await session.save();

    res.json({ message: "Seat unlocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
