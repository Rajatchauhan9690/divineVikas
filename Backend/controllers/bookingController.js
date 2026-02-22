import Session from "../models/session.model.js";
import Booking from "../models/session.model.js";
import { getIO } from "../socket.js";
import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| BOOKING CONTROLLER (PRODUCTION READY)
|--------------------------------------------------------------------------
*/

const LOCK_TIME = 5 * 60 * 1000;

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

export const bookSeat = async (req, res) => {
  try {
    const { sessionId, seatNumber, userName } = req.body;

    if (!sessionId || seatNumber === undefined || !userName) {
      return res.status(400).json({
        message: "sessionId, seatNumber and userName are required",
      });
    }

    const sessionData = await Session.findOne({
      _id: sessionId,
      bookedSeats: { $nin: [seatNumber] },
      lockedSeats: {
        $elemMatch: { seatNumber: seatNumber },
      },
    });
    // console.log("Session Data Found:", sessionData);
    if (!sessionData) {
      throw new Error("Seat not available for booking");
    }

    await Session.updateOne(
      { _id: sessionId },
      {
        $addToSet: { bookedSeats: seatNumber },
        $pull: { lockedSeats: { seatNumber } },
        $set: { status: "booked" },
      },
    );

    const booking = await Booking.create({
      session: sessionId,
      seatNumber,
      userName,
    });

    if (getIO()) {
      getIO().to(sessionId).emit("seat-updated", sessionId);
    }

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
export const lockSeat = async (req, res) => {
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
        bookedSeats: { $nin: [seatNumber] },
        lockedSeats: { $not: { $elemMatch: { seatNumber } } },
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
        $pull: {
          lockedSeats: { seatNumber },
        },
        $set: {
          status: "available",
        },
      },
      {
        new: true,
      },
    );

    if (!session) {
      return res.status(404).json({
        message: "Seat not found in locked state",
      });
    }

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
