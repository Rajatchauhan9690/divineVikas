import Session from "../models/Session.js";
import Booking from "../models/Booking.js";
import { getIO } from "../socket.js";

const LOCK_TIME = 5 * 60 * 1000; // 5 minutes

/* ===============================
   BOOK SEAT (FINAL CONFIRMATION)
================================ */
export const bookSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, userName } = req.body;

    if (!sessionId || seatNumber === undefined || !userName) {
      return res.status(400).json({
        message: "sessionId, seatNumber and userName are required",
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Remove expired locks
    session.lockedSeats = session.lockedSeats.filter(
      (seat) => Date.now() - seat.lockedAt.getTime() < LOCK_TIME,
    );

    if (session.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    const lockedSeat = session.lockedSeats.find(
      (seat) => seat.seatNumber === seatNumber,
    );

    if (!lockedSeat) {
      return res.status(400).json({
        message: "Seat not locked or lock expired",
      });
    }

    // Move locked → booked
    session.bookedSeats.push(seatNumber);
    session.lockedSeats = session.lockedSeats.filter(
      (seat) => seat.seatNumber !== seatNumber,
    );

    await session.save();

    // 🔥 Emit real-time update
    const io = getIO();
    io.to(sessionId).emit("seat-updated", sessionId);

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

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber are required",
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Remove expired locks
    session.lockedSeats = session.lockedSeats.filter(
      (seat) => Date.now() - seat.lockedAt.getTime() < LOCK_TIME,
    );

    if (session.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked" });
    }

    const alreadyLocked = session.lockedSeats.find(
      (seat) => seat.seatNumber === seatNumber,
    );

    if (alreadyLocked) {
      return res.status(400).json({ message: "Seat already locked" });
    }

    session.lockedSeats.push({
      seatNumber,
      lockedAt: new Date(),
    });

    await session.save();

    // 🔥 Emit real-time update
    const io = getIO();
    io.to(sessionId).emit("seat-updated", sessionId);

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

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber are required",
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.lockedSeats = session.lockedSeats.filter(
      (seat) => seat.seatNumber !== seatNumber,
    );

    await session.save();

    // 🔥 Emit real-time update
    const io = getIO();
    io.to(sessionId).emit("seat-updated", sessionId);

    res.json({ message: "Seat unlocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
