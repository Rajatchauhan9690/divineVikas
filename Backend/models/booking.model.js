import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // pricePerSeat: {
    //   type: Number,
    //   required: true,
    // },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

bookingSchema.index({ session: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
