import axios from "axios";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Session from "../models/session.model.js";
import { getIO } from "../socket/socket.js";

/*
=====================================
PAYMENT CONTROLLER
=====================================
*/

export const createPayment = async (req, res) => {
  try {
    console.log("💳 Payment Order Request:", req.body);

    const { sessionId, seatNumber, amount } = req.body;

    const booking = await Booking.findOne({
      session: sessionId,
      seatNumber,
      status: "PENDING",
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const orderId = "order_" + Date.now();

    const request = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: booking.userName || "guest_" + Date.now(),
        customer_phone: "9999999999",
      },
    };

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      request,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      },
    );

    const paymentSessionId = response?.data?.payment_session_id;

    if (!paymentSessionId) throw new Error("Payment session creation failed");

    await Payment.create({
      booking: booking._id,
      orderId,
      amount,
      currency: "INR",
      paymentSessionId,
      status: "PENDING",
    });

    console.log("✅ Payment Order Created:", orderId);

    res.json({
      success: true,
      orderId,
      payment_session_id: paymentSessionId,
    });
  } catch (error) {
    console.error("❌ Payment Order Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
    });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    console.log("🌐 Webhook Received:", JSON.stringify(req.body));

    const event = req.body;

    const orderId = event?.data?.order?.order_id;
    const paymentStatus = event?.data?.payment?.payment_status;
    const transactionId = event?.data?.payment?.cf_payment_id;

    if (!orderId) return res.sendStatus(400);

    const payment = await Payment.findOne({ orderId }).populate("booking");

    if (!payment) return res.sendStatus(404);

    if (payment.status === "PAID") return res.sendStatus(200);

    const booking = payment.booking;

    if (!booking) return res.sendStatus(200);

    if (paymentStatus === "SUCCESS") {
      console.log("💰 Payment Success:", orderId);

      payment.status = "PAID";
      payment.transactionId = transactionId;

      await payment.save();

      await Session.findByIdAndUpdate(booking.session, {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
        $addToSet: {
          bookedSeats: booking.seatNumber,
        },
      });

      await Booking.findByIdAndUpdate(booking._id, {
        status: "CONFIRMED",
      });
    }

    if (paymentStatus === "FAILED") {
      console.log("❌ Payment Failed:", orderId);

      payment.status = "FAILED";
      await payment.save();

      await Session.findByIdAndUpdate(booking.session, {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      });

      await Booking.findByIdAndDelete(booking._id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.sendStatus(500);
  }
};
