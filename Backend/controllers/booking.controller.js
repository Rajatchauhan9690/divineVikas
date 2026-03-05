import Session from "../models/session.model.js";
import Booking from "../models/booking.model.js";
import { getIO } from "../socket/socket.js";
import { cleanupExpiredLocks } from "../utils/lock.util.js";

export const lockSeat = async (req, res) => {
  try {
    console.log("🔒 Lock Seat API called");
    console.log("Request Body:", req.body);

    const { sessionId, seatNumber } = req.body;

    if (!sessionId || seatNumber === undefined) {
      console.log("❌ Missing sessionId or seatNumber");
      throw new Error("sessionId and seatNumber are required");
    }

    const session = await Session.findById(sessionId);
    console.log("Session found:", !!session);

    if (!session) throw new Error("Session not found");

    await cleanupExpiredLocks(session);
    console.log("Expired locks cleaned");

    const seatTaken =
      session.bookedSeats.includes(seatNumber) ||
      session.lockedSeats.some((s) => s.seatNumber === seatNumber);

    console.log("Seat Taken Status:", seatTaken);

    if (seatTaken) {
      return res.status(400).json({
        success: false,
        message: "Seat already taken",
      });
    }

    const lockResult = await Session.updateOne(
      {
        _id: sessionId,
        bookedSeats: { $ne: seatNumber },
        "lockedSeats.seatNumber": { $ne: seatNumber },
      },
      {
        $push: {
          lockedSeats: {
            seatNumber,
            lockedAt: new Date(),
          },
        },
      },
    );

    console.log("Lock Update Result:", lockResult);

    if (lockResult.modifiedCount === 0) {
      console.log("⚠ Seat already locked");
      return res.status(400).json({
        success: false,
        message: "Seat already locked",
      });
    }

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
      console.log("📡 Socket event emitted: seat-updated");
    }

    res.json({
      success: true,
      message: "Seat locked",
    });
  } catch (error) {
    console.error("🔥 Lock Seat Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unlockSeat = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) throw new Error("bookingId required");

    const booking = await Booking.findById(bookingId);

    if (!booking) throw new Error("Booking not found");

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

    if (getIO()) {
      getIO()
        .to(booking.session.toString())
        .emit("seat-updated", booking.session);
    }

    res.json({
      success: true,
      message: "Seat unlocked",
    });
  } catch (error) {
    console.error("Unlock Seat Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    console.log("📝 Create Booking API called");
    console.log("Request Body:", req.body);

    const {
      sessionId,
      seatNumber,
      pricePerSeat,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    if (!sessionId || seatNumber === undefined) {
      console.log("❌ Required booking data missing");
      throw new Error("Required booking data missing");
    }

    const totalAmount = pricePerSeat;

    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      totalAmount: pricePerSeat,
      customerName,
      customerEmail,
      customerPhone,
      status: "PENDING",
    });

    console.log("✅ Booking Created:", booking._id);

    res.json({
      success: true,
      bookingId: booking._id,
      message: "Booking created",
      totalAmount,
    });
  } catch (error) {
    console.error("🔥 Create Booking Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    console.log("✅ Confirm Booking API called");
    console.log("Request Body:", req.body);

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    console.log("Booking Found:", !!booking);

    if (!booking) throw new Error("Booking not found");

    booking.status = "CONFIRMED";
    booking.expiresAt = null;
    await booking.save();

    console.log("Booking status updated to CONFIRMED");

    await Session.updateOne(
      { _id: booking.session },
      {
        $addToSet: {
          bookedSeats: booking.seatNumber,
        },
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      },
    );

    console.log("Session seats updated after confirmation");

    if (getIO()) {
      getIO()
        .to(booking.session.toString())
        .emit("seat-updated", booking.session);

      console.log("📡 Socket event emitted: seat-updated");
    }

    res.json({
      success: true,
      message: "Booking confirmed",
    });
  } catch (error) {
    console.error("🔥 Confirm Booking Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    console.log("❌ Cancel Booking API called");
    console.log("Request Body:", req.body);

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    console.log("Booking Found:", !!booking);

    if (!booking) throw new Error("Booking not found");

    if (booking.status === "CONFIRMED") {
      console.log("⚠ Booking already confirmed");
      return res.json({
        success: false,
        message: "Booking already confirmed",
      });
    }

    await Session.updateOne(
      { _id: booking.session },
      {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      },
    );

    console.log("Session lock removed");

    booking.status = "FAILED";
    await booking.save();

    console.log("Booking marked FAILED");

    if (getIO()) {
      getIO()
        .to(booking.session.toString())
        .emit("seat-updated", booking.session);

      console.log("📡 Socket event emitted: seat-updated");
    }

    res.json({
      success: true,
      message: "Booking cancelled",
    });
  } catch (error) {
    console.error("🔥 Cancel Booking Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    console.log("📊 Get All Bookings API called");

    const bookings = await Booking.find().populate("session");

    console.log("Total bookings fetched:", bookings.length);

    res.json(bookings);
  } catch (error) {
    console.error("🔥 Get Bookings Error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
};
export const getBookingById = async (req, res) => {
  try {
    console.log("📄 Get Booking By ID API called");

    const { bookingId } = req.params;

    console.log("📥 Booking ID received:", bookingId);

    if (!bookingId) {
      console.log("❌ bookingId not provided");

      return res.status(400).json({
        success: false,
        message: "bookingId required",
      });
    }

    console.log("🔍 Searching booking in database...");

    const booking = await Booking.findById(bookingId).populate("session");

    console.log("📦 Booking DB Result:", booking);

    if (!booking) {
      console.log("❌ Booking not found in database");

      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("✅ Booking found, sending response");

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("🔥 Get Booking By ID Error:", error);
    console.error("🔥 Error Message:", error.message);
    console.error("🔥 Error Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
