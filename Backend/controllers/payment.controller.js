import axios from "axios";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Session from "../models/session.model.js";

const validateBooking = async (bookingId) => {
  if (!bookingId) throw new Error("BookingId is required");

  const booking = await Booking.findById(bookingId);

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "PENDING") {
    throw new Error("Booking expired or already processed");
  }

  return booking;
};

export const createPayment = async (req, res) => {
  try {
    console.log("💳 Create Payment API Called");
    console.log("Request Body:", req.body);

    const { bookingId, customerName, customerEmail, customerPhone } = req.body;

    const booking = await validateBooking(bookingId);

    console.log("Booking Found:", booking._id);

    const existingPayment = await Payment.findOne({
      booking: booking._id,
      status: "PENDING",
    });

    if (existingPayment) {
      console.log("⚠ Existing pending payment found");

      return res.json({
        orderId: existingPayment.orderId,
        payment_session_id: existingPayment.paymentSessionId,
      });
    }

    const orderId = "order_" + Date.now();

    console.log("Generated Order ID:", orderId);

    const orderRequest = {
      order_id: orderId,
      order_amount: booking.totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: "guest_" + Date.now(),
        customer_name: customerName || "Guest",
        customer_email: customerEmail || "guest@email.com",
        customer_phone: customerPhone || "0000000000",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-success?order_id={order_id}&booking_id=${bookingId}`,
      },
    };

    console.log("Cashfree Order Request:", orderRequest);

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      orderRequest,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Cashfree Response:", response.data);

    const paymentSessionId = response.data.payment_session_id;

    await Payment.create({
      booking: booking._id,
      orderId,
      amount: booking.totalAmount,
      currency: "INR",
      paymentSessionId,
      status: "PENDING",
    });

    console.log("Payment Record Created");

    return res.json({
      orderId,
      payment_session_id: paymentSessionId,
    });
  } catch (error) {
    console.error("🔥 Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment failed",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log("verify payment");

    if (!orderId) {
      return res.status(400).json({
        message: "OrderId is required",
      });
    }

    const payment = await Payment.findOne({ orderId }).populate("booking");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Idempotency guard
    if (payment.status === "PAID") {
      return res.json({
        success: true,
        message: "Payment already processed",
        bookingId: payment.booking?._id,
      });
    }

    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-08-01",
        },
      },
    );

    const orderStatus = response.data.order_status;
    const booking = payment.booking;

    // ✅ Payment success flow
    if (orderStatus === "PAID") {
      payment.status = "PAID";
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

      return res.json({
        success: true,
        message: "Booking confirmed",
        bookingId: booking._id,
      });
    }

    // ✅ Handle all failure / pending / cancelled states
    payment.status = orderStatus;
    await payment.save();

    await Booking.findByIdAndUpdate(booking._id, {
      status: "FAILED",
    });

    await Session.findByIdAndUpdate(booking.session, {
      $pull: {
        lockedSeats: { seatNumber: booking.seatNumber },
      },
    });

    return res.json({
      success: false,
      status: orderStatus,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
