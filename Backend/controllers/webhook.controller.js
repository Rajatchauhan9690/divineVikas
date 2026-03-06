import crypto from "crypto";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Session from "../models/session.model.js";
import { getIO } from "../socket/socket.js";

export const cashfreeWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook received from Cashfree");

    // 1. Extract Cashfree Headers
    const ts = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];

    // Cashfree requires the raw payload for signature verification
    const rawBody = JSON.stringify(req.body);

    // 2. Verify the Signature (CRITICAL SECURITY STEP)
    // If you skip this, anyone can use Postman to confirm fake bookings
    const generatedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
      .update(ts + rawBody)
      .digest("base64");

    if (generatedSignature !== signature) {
      console.log("❌ Webhook signature mismatch! Potential attack blocked.");
      return res.status(400).send("Invalid Signature");
    }

    const event = req.body;

    // 3. Process the Payment Success Event
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = event.data.order.order_id;
      console.log(`✅ Payment verified via Webhook for Order: ${orderId}`);

      // Find the payment and populate the booking
      const payment = await Payment.findOne({ orderId }).populate("booking");

      if (!payment) {
        console.log("❌ Payment record not found for webhook");
        return res.status(404).send("Payment not found");
      }

      // Idempotency check: Don't process it twice if the frontend already did
      if (payment.status !== "PAID") {
        payment.status = "PAID";
        await payment.save();

        const booking = payment.booking;

        // Update Booking Status
        await Booking.findByIdAndUpdate(booking._id, { status: "CONFIRMED" });

        // Update Session Seats
        await Session.findByIdAndUpdate(booking.session, {
          $pull: { lockedSeats: { seatNumber: booking.seatNumber } },
          $addToSet: { bookedSeats: booking.seatNumber },
        });

        // Emit Socket Event to update everyone else's screen live
        if (getIO()) {
          getIO()
            .to(booking.session.toString())
            .emit("seat-updated", booking.session);
        }

        console.log(
          `🎉 Booking ${booking._id} confirmed entirely via Webhook!`,
        );
      } else {
        console.log("ℹ️ Webhook received but payment was already marked PAID.");
      }
    }

    // Always return 200 OK so Cashfree knows we received it and stops retrying
    res.status(200).send("OK");
  } catch (error) {
    console.error("🔥 Webhook Processing Error:", error.message);
    res.status(500).send("Internal Webhook Error");
  }
};
