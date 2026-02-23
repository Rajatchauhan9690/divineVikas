// import Session from "../models/session.models.js";
// import Booking from "../models/booking.models.js";
// import { getIO } from "../socket.js";
// import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| BOOKING CONTROLLER (PRODUCTION READY)
|--------------------------------------------------------------------------
*/

// const LOCK_TIME = 5 * 60 * 1000;

/* ===============================
   LOCK SEAT
================================ */
// export const lockSeat = async (req, res) => {
//   try {
//     const { sessionId, seatNumber } = req.body;

//     if (!sessionId || seatNumber === undefined) {
//       return res.status(400).json({
//         message: "sessionId and seatNumber are required",
//       });
//     }

//     const session = await Session.findOneAndUpdate(
//       {
//         _id: sessionId,
//         bookedSeats: { $ne: seatNumber },
//         "lockedSeats.seatNumber": { $ne: seatNumber },
//       },
//       {
//         $push: {
//           lockedSeats: {
//             seatNumber,
//             lockedAt: new Date(),
//           },
//         },
//         $set: { status: "locked" },
//       },
//       { new: true },
//     );

//     if (!session) {
//       return res.status(400).json({
//         message: "Seat not available for locking",
//       });
//     }

//     getIO().to(sessionId).emit("seat-updated", sessionId);

//     res.json({ message: "Seat locked successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/* ===============================
   UNLOCK SEAT
================================ */
// export const unlockSeat = async (req, res) => {
//   try {
//     const { sessionId, seatNumber } = req.body;

//     const session = await Session.findByIdAndUpdate(
//       sessionId,
//       {
//         $pull: { lockedSeats: { seatNumber } },
//         $set: { status: "available" },
//       },
//       { new: true },
//     );

//     if (!session) {
//       return res.status(404).json({
//         message: "Session not found",
//       });
//     }

//     getIO().to(sessionId).emit("seat-updated", sessionId);

//     res.json({ message: "Seat unlocked successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/* ===============================
   BOOK SEAT (FINAL CONFIRMATION)
================================ */
// export const bookSeat = async (req, res) => {
//   const mongoSession = await mongoose.startSession();

//   try {
//     const { sessionId, seatNumber, userName } = req.body;

//     if (!sessionId || seatNumber === undefined || !userName) {
//       return res.status(400).json({
//         message: "sessionId, seatNumber and userName are required",
//       });
//     }

//     await mongoSession.startTransaction();

//     const sessionData = await Session.findOne({
//       _id: sessionId,
//       bookedSeats: { $ne: seatNumber },
//       "lockedSeats.seatNumber": seatNumber,
//     }).session(mongoSession);

//     if (!sessionData) {
//       throw new Error("Seat not available for booking");
//     }

//     await Session.updateOne(
//       { _id: sessionId },
//       {
//         $addToSet: { bookedSeats: seatNumber },
//         $pull: { lockedSeats: { seatNumber } },
//         $set: { status: "booked" },
//       },
//     ).session(mongoSession);

//     const booking = await Booking.create(
//       [
//         {
//           session: sessionId,
//           seatNumber,
//           userName,
//         },
//       ],
//       { session: mongoSession },
//     );

//     await mongoSession.commitTransaction();

//     if (getIO()) {
//       getIO().to(sessionId).emit("seat-updated", sessionId);
//     }

//     res.status(201).json({
//       message: "Seat booked successfully",
//       booking: booking[0],
//     });
//   } catch (error) {
//     await mongoSession.abortTransaction();

//     console.error("Booking Error:", error);

//     res.status(500).json({
//       message: error.message || "Booking failed",
//     });
//   } finally {
//     mongoSession.endSession();
//   }
// };

import Session from "../models/session.models.js";
import Booking from "../models/booking.models.js";
import { getIO } from "../socket.js";

/*
|--------------------------------------------------------------------------
| BOOKING CONTROLLER (PRODUCTION CLEAN VERSION)
|--------------------------------------------------------------------------
*/

const LOCK_TIME = 5 * 60 * 1000;

/* ===============================
   LOCK SEAT
================================ */
export const lockSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, unlock } = req.body;

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber are required",
      });
    }

    // 🔥 Unlock request handling
    if (unlock) {
      await Session.updateOne(
        { _id: sessionId },
        {
          $pull: {
            lockedSeats: { seatNumber },
          },
        },
      );

      return res.json({
        message: "Seat unlocked successfully",
      });
    }

    // 🔥 Lock seat logic
    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        bookedSeats: { $nin: [seatNumber] },
        "lockedSeats.seatNumber": { $ne: seatNumber },
      },
      {
        $push: {
          lockedSeats: {
            seatNumber,
            lockedAt: new Date(),
          },
        },
        $set: { status: "locked" },
      },
      { new: true },
    );

    if (!session) {
      return res.status(400).json({
        message: "Seat not available for locking",
      });
    }

    getIO().to(sessionId).emit("seat-updated", sessionId);

    res.json({
      message: "Seat locked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Locking failed",
    });
  }
};

/* ===============================
   UNLOCK SEAT (Optional API)
================================ */

export const unlockSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber } = req.body;

    if (!sessionId || seatNumber === undefined) {
      return res.status(400).json({
        message: "sessionId and seatNumber are required",
      });
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        "lockedSeats.seatNumber": seatNumber,
      },
      {
        $pull: { lockedSeats: { seatNumber } },
        $set: { status: "available" },
      },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({
        message: "Seat not found in locked state",
      });
    }

    getIO().to(sessionId).emit("seat-updated", sessionId);

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
        message: "sessionId, seatNumber and userName are required",
      });
    }

    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        bookedSeats: { $nin: [seatNumber] },
        "lockedSeats.seatNumber": seatNumber,
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

    getIO().to(sessionId).emit("seat-updated", sessionId);

    res.status(201).json({
      message: "Seat booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking Error:", error);

    res.status(500).json({
      message: error.message || "Booking failed",
    });
  }
};
