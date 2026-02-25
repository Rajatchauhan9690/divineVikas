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
    console.log("🔍 Lock seat API called");
    console.log("Request body:", req.body);

    const { sessionId, seatNumber, userName } = req.body;

    if (!sessionId || seatNumber === undefined) {
      console.log("❌ Missing sessionId or seatNumber");
      return res.status(400).json({
        message: "sessionId and seatNumber required",
      });
    }

    const session = await Session.findById(sessionId);

    console.log("Session found:", !!session);

    if (!session) {
      console.log("❌ Session not found:", sessionId);
      return res.status(404).json({ message: "Session not found" });
    }

    await cleanupExpiredLocks(session);

    console.log("Cleaned expired locks");

    // Seat availability check
    const seatTaken =
      session.bookedSeats.includes(seatNumber) ||
      session.lockedSeats.some((s) => s.seatNumber === seatNumber);

    console.log("Seat availability check:", {
      seatNumber,
      seatTaken,
    });

    if (seatTaken) {
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

    console.log("Locking seat:", seatNumber);

    session.lockedSeats.push({
      seatNumber,
      lockedAt: new Date(),
    });

    session.status = "locked";

    await session.save();

    console.log("Session updated with locked seat");

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

    console.log("Booking created:", booking._id);

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
      console.log("Socket event emitted: seat-updated");
    }

    res.json({
      success: true,
      bookingId: booking._id,
      message: "Seat locked and booking created",
    });
  } catch (error) {
    console.error("🔥 Lock Seat Error:", error);
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
    console.log("🔍 Cancel booking API called");
    console.log("Request body:", req.body);

    const { bookingId } = req.body;

    if (!bookingId) {
      console.log("❌ Booking ID missing");
      return res.status(400).json({
        message: "Booking ID required",
      });
    }

    const booking = await Booking.findById(bookingId);

    console.log("Booking found:", !!booking);

    if (!booking) {
      console.log("❌ Booking not found:", bookingId);
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "CONFIRMED") {
      console.log("⚠ Booking already confirmed, cannot cancel");
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

    console.log("Unlocking seat:", booking.seatNumber);

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

    console.log("Booking marked FAILED");

    if (getIO()) {
      getIO()
        .to(booking.session.toString())
        .emit("seat-updated", booking.session);

      console.log("Socket event emitted: seat-updated");
    }

    res.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error("🔥 Cancel Booking Error:", error);
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
    console.log("🔍 Fetching all bookings");

    const bookings = await Booking.find().populate("session");

    console.log("Total bookings found:", bookings.length);

    res.json(bookings);
  } catch (error) {
    console.error("🔥 Get bookings error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
