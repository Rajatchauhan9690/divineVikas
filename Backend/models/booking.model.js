import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    seatNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED"],
      default: "PENDING",
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Optional index for faster lookup
bookingSchema.index({ session: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
