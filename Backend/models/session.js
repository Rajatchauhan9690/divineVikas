import mongoose from "mongoose";

const lockedSeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    bookedSeats: {
      type: [Number],
      default: [],
    },

    lockedSeats: {
      type: [lockedSeatSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// Optional index for performance
sessionSchema.index({ name: 1, date: 1, time: 1 });

export default mongoose.model("Session", sessionSchema);
