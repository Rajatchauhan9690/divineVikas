import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    seatNumber: Number,
    userName: String,
    userEmail: String,
    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
