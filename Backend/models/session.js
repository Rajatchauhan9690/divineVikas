import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    name: String,
    date: String,
    time: String,
    totalSeats: Number,

    bookedSeats: {
      type: [Number],
      default: [],
    },

    lockedSeats: [
      {
        seatNumber: Number,
        lockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
