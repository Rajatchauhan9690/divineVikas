import mongoose from "mongoose";

const lockedSeatSchema = new mongoose.Schema(
  {
    seatNumber: Number,
    lockedAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes auto delete
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
      type: Date,
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

    status: {
      type: String,
      enum: ["available", "locked", "booked", "selected"],
      default: "available",
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
