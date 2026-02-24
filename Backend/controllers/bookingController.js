import Session from "../models/session.models.js";
import Booking from "../models/booking.models.js";
import { getIO } from "../socket.js";

/*
|--------------------------------------------------------------------------
| PRODUCTION READY BOOKING CONTROLLER
|--------------------------------------------------------------------------
*/

/* ===============================
   LOCK EXPIRY CHECKER
================================ */

const isLockExpired = (lockedAt) => {
  return Date.now() - new Date(lockedAt).getTime() > 5 * 60 * 1000;
};

/* ===============================
   CLEAN EXPIRED LOCKS HELPER
================================ */

const cleanupExpiredLocks = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) return null;

  session.lockedSeats = session.lockedSeats.filter(
    (seat) => !isLockExpired(seat.lockedAt),
  );

  await session.save();

  return session;
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

    // Cleanup expired locks first
    const session = await cleanupExpiredLocks(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const alreadyBooked = session.bookedSeats.includes(seatNumber);

    const alreadyLocked = session.lockedSeats.some(
      (seat) => seat.seatNumber === seatNumber,
    );

    if (alreadyBooked || alreadyLocked) {
      return res.status(400).json({
        message: "Seat not available",
      });
    }

    session.lockedSeats.push({
      seatNumber,
      lockedAt: new Date(),
    });

    session.status = "locked";

    await session.save();

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.json({
      message: "Seat locked successfully",
    });
  } catch (error) {
    console.error("Lock Seat Error:", error);

    res.status(500).json({
      message: error.message || "Locking failed",
    });
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

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.json({
      message: "Seat unlocked successfully",
    });
  } catch (error) {
    console.error("Unlock Seat Error:", error);

    res.status(500).json({
      message: error.message || "Unlock failed",
    });
  }
};

/* ===============================
   BOOK SEAT (FINAL CONFIRMATION)
================================ */

export const bookSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, userName } = req.body;

    if (!sessionId || seatNumber === undefined || !userName) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        bookedSeats: { $nin: [seatNumber] },
        lockedSeats: {
          $elemMatch: {
            seatNumber,
            lockedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
          },
        },
      },
      {
        $addToSet: { bookedSeats: seatNumber },
        $pull: { lockedSeats: { seatNumber } },
        $set: { status: "booked" },
      },
      { new: true },
    );

    if (!session) {
      return res.status(400).json({
        message: "Seat already booked or lock expired",
      });
    }

    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      userName,
    });

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.status(201).json({
      message: "Booking successful",
      booking,
    });
  } catch (error) {
    console.error("Booking Error:", error);

    res.status(500).json({
      message: "Booking failed",
    });
  }
};
