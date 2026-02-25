import Session from "../models/session.model.js";
import Booking from "../models/booking.model.js";
import { getIO } from "../socket/socket.js";
import { cleanupExpiredLocks, isLockExpired } from "../utils/lock.util.js";

/*
=====================================
BOOKING CONTROLLER
=====================================
*/

export const lockSeat = async (req, res) => {
  try {
    console.log("🔒 Lock Seat Request:", req.body);

    const { sessionId, seatNumber } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    await cleanupExpiredLocks(session);

    if (
      session.bookedSeats.includes(seatNumber) ||
      session.lockedSeats.some((s) => s.seatNumber === seatNumber)
    ) {
      return res.status(400).json({ message: "Seat already taken" });
    }

    session.lockedSeats.push({
      seatNumber,
      lockedAt: new Date(),
    });

    session.status = "locked";

    await session.save();

    console.log("✅ Seat Locked:", seatNumber);

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.json({ success: true, message: "Seat locked successfully" });
  } catch (error) {
    console.error("❌ Lock Seat Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const unlockSeat = async (req, res) => {
  try {
    console.log("🔓 Unlock Seat Request:", req.body);

    const { sessionId, seatNumber } = req.body;

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber required",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    session.lockedSeats = session.lockedSeats.filter(
      (seat) => seat.seatNumber !== seatNumber,
    );

    if (session.lockedSeats.length === 0 && session.bookedSeats.length === 0) {
      session.status = "available";
    }

    await session.save();

    console.log("✅ Seat unlocked:", seatNumber);

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.json({
      success: true,
      message: "Seat unlocked successfully",
    });
  } catch (error) {
    console.error("❌ Unlock Seat Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const bookSeat = async (req, res) => {
  try {
    console.log("🎫 Book Seat Request:", req.body);

    const { sessionId, seatNumber, userName } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    await cleanupExpiredLocks(session);

    const lockValid = session.lockedSeats.some(
      (seat) => seat.seatNumber === seatNumber && !isLockExpired(seat.lockedAt),
    );

    if (!lockValid) {
      return res.status(400).json({
        message: "Seat lock expired",
      });
    }

    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      userName,
      status: "PENDING",
    });

    console.log("✅ Booking Created:", booking._id);

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.status(201).json({
      success: true,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("❌ Booking Error:", error.message);
    res.status(500).json({ message: "Booking failed" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    console.log("❌ Cancel Booking Request:", req.body);

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.json({ success: false, message: "Booking not found" });

    await Session.updateOne(
      { _id: booking.session },
      {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      },
    );

    booking.status = "FAILED";
    await booking.save();

    console.log("✅ Booking Cancelled:", bookingId);

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Cancel Booking Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAllBookings = async (req, res) => {
  try {
    console.log("📊 Fetch bookings");

    const bookings = await Booking.find().populate("session");

    res.json(bookings);
  } catch (error) {
    console.error("❌ Booking List Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
