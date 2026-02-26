import axios from "axios";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Session from "../models/session.model.js";

export const createPayment = async (req, res) => {
  try {
    console.log("🔍 Create payment API called");
    console.log("Request body:", req.body);

    const { sessionId, seatNumber, amount } = req.body;

    const booking = await Booking.findOne({
      session: sessionId,
      seatNumber,
      status: "PENDING",
    });

    console.log("Booking lookup result:", !!booking);

    if (!booking) {
      console.log("❌ Booking not found for payment creation");
      return res.status(404).json({ message: "Booking not found" });
    }

    const orderId = "order_" + Date.now();
    console.log("Generated orderId:", orderId);

    const request = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: booking.userName || "guest_" + Date.now(),
        customer_phone: "9999999999",
      },
    };

    console.log("Cashfree order request payload:", request);

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

    console.log("Cashfree order response received");

    const paymentSessionId = response?.data?.payment_session_id?.trim();

    console.log("Payment session ID:", paymentSessionId ? "Exists" : "Missing");

    if (!paymentSessionId) throw new Error("Payment session creation failed");

    await Payment.create({
      booking: booking._id,
      orderId,
      amount,
      currency: "INR",
      paymentSessionId,
      status: "PENDING",
    });

    console.log("Payment record created in database");

    res.json({
      success: true,
      orderId,
      payment_session_id: paymentSessionId,
    });
  } catch (error) {
    console.error("🔥 Create Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    console.log("🔍 Verify payment API called");

    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId }).populate("booking");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // IF PAYMENT ALREADY PROCESSED

    if (payment.status === "PAID") {
      return res.json({
        success: true,
        status: payment.status,
        transactionId: payment.transactionId,
      });
    }

    //  FETCH PAYMENT STATUS FROM CASHFREE

    const gatewayResponse = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-08-01",
        },
      },
    );

    const orderStatus = gatewayResponse?.data?.order_status;

    const booking = payment.booking;

    //    PAYMENT SUCCESS → CONFIRM BOOKING

    if (["PAID", "SUCCESS", "COMPLETED"].includes(orderStatus)) {
      payment.status = "PAID";
      payment.transactionId = gatewayResponse?.data?.cf_payment_id || null;

      await payment.save();

      // Remove locked seat and confirm booking

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

      return res.json({
        success: true,
        status: "PAID",
        message: "Booking confirmed",
      });
    }

    //   PAYMENT FAILED / EXPIRED

    if (["FAILED", "EXPIRED"].includes(orderStatus)) {
      payment.status = "FAILED";

      await payment.save();

      await Session.findByIdAndUpdate(booking.session, {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      });

      await Booking.findByIdAndDelete(booking._id);

      return res.json({
        success: true,
        status: "FAILED",
        message: "Booking cancelled",
      });
    }

    return res.json({
      success: true,
      status: orderStatus,
    });
  } catch (error) {
    console.error("🔥 Verify Payment Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
