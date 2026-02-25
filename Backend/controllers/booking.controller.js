import Session from "../models/session.model.js";
import Booking from "../models/booking.model.js";
import { getIO } from "../socket/socket.js";
import { cleanupExpiredLocks, isLockExpired } from "../utils/lock.util.js";

/*
==================================================
LOCK SEAT + CREATE BOOKING (PRIMARY FLOW)
==================================================
*/

export const lockSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, userName } = req.body;

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber required",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    await cleanupExpiredLocks(session);

    // Seat availability check
    if (
      session.bookedSeats.includes(seatNumber) ||
      session.lockedSeats.some((s) => s.seatNumber === seatNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Seat already taken",
      });
    }

    /*
    =============================
    LOCK SEAT
    =============================
    */

    session.lockedSeats.push({
      seatNumber,
      lockedAt: new Date(),
    });

    session.status = "locked";

    await session.save();

    /*
    =============================
    CREATE BOOKING (PENDING)
    =============================
    */

    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      userName: userName || "Guest",
      status: "PENDING",
    });

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

    res.json({
      success: true,
      bookingId: booking._id,
      message: "Seat locked and booking created",
    });
  } catch (error) {
    console.error("Lock Seat Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
CANCEL BOOKING
==================================================
*/

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId)
      return res.status(400).json({
        message: "Booking ID required",
      });

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.status(404).json({
        message: "Booking not found",
      });

    if (booking.status === "CONFIRMED") {
      return res.json({
        success: false,
        message: "Booking already confirmed",
      });
    }

    /*
    =============================
    UNLOCK SEAT
    =============================
    */

    await Session.updateOne(
      { _id: booking.session },
      {
        $pull: {
          lockedSeats: {
            seatNumber: booking.seatNumber,
          },
        },
      },
    );

    booking.status = "FAILED";
    await booking.save();

    if (getIO()) {
      getIO()
        .to(booking.session.toString())
        .emit("seat-updated", booking.session);
    }

    res.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
GET BOOKINGS
==================================================
*/

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("session");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
