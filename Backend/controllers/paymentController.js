import { Cashfree } from "cashfree-pg";
import Payment from "../models/payment.models.js";
import Booking from "../models/booking.models.js";
import Session from "../models/session.models.js";

// =======================================
// 🔐 Cashfree Configuration
// =======================================
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment =
  process.env.NODE_ENV === "production"
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

// ==================================================
// 1️⃣ CREATE PAYMENT
// ==================================================
export const createPayment = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Amount and bookingId are required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const orderId = "order_" + Date.now();

    const request = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: req.user?._id?.toString() || "guest_user",
        customer_phone: req.user?.phone || "9999999999",
      },
      order_meta: {
        return_url:
          process.env.FRONTEND_URL + "/payment-success?order_id={order_id}",
      },
    };

    const response = await Cashfree.PGCreateOrder(request);

    await Payment.create({
      user: req.user?._id || null,
      booking: bookingId,
      orderId,
      amount,
      currency: "INR",
      paymentSessionId: response.data.payment_session_id,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      orderId,
      payment_session_id: response.data.payment_session_id,
    });
  } catch (error) {
    console.error(
      "Create Payment Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

// ==================================================
// 2️⃣ VERIFY PAYMENT (Manual Backup Verification)
// ==================================================
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "OrderId required",
      });
    }

    const response = await Cashfree.PGFetchOrder(orderId);
    const orderStatus = response.data.order_status;

    const payment = await Payment.findOne({ orderId }).populate("booking");
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Already processed
    if (payment.status === "PAID") {
      return res.json({ success: true, message: "Already paid" });
    }

    // ================= SUCCESS =================
    if (orderStatus === "PAID") {
      payment.status = "PAID";
      payment.transactionId = response.data.cf_order_id;
      await payment.save();

      const booking = payment.booking;

      await Session.findByIdAndUpdate(booking.session, {
        $pull: { lockedSeats: { seatNumber: booking.seatNumber } },
        $addToSet: { bookedSeats: booking.seatNumber },
      });

      return res.json({
        success: true,
        message: "Payment verified & seat confirmed",
      });
    }

    // ================= FAILED =================
    if (orderStatus === "FAILED") {
      payment.status = "FAILED";
      await payment.save();

      const booking = payment.booking;

      await Session.findByIdAndUpdate(booking.session, {
        $pull: { lockedSeats: { seatNumber: booking.seatNumber } },
      });

      await Booking.findByIdAndDelete(booking._id);

      return res.json({
        success: false,
        message: "Payment failed & seat released",
      });
    }

    return res.json({
      success: false,
      status: orderStatus,
    });
  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// ==================================================
// 3️⃣ CASHFREE WEBHOOK (AUTOMATIC CONFIRMATION)
// ==================================================
export const cashfreeWebhook = async (req, res) => {
  try {
    const event = req.body;

    const orderId = event?.data?.order?.order_id;
    const paymentStatus = event?.data?.payment?.payment_status;
    const transactionId = event?.data?.payment?.cf_payment_id;

    if (!orderId) return res.sendStatus(400);

    const payment = await Payment.findOne({ orderId }).populate("booking");
    if (!payment) return res.sendStatus(404);

    // 🔥 Prevent duplicate execution
    if (payment.status === "PAID") {
      return res.sendStatus(200);
    }

    const booking = payment.booking;

    // ================= SUCCESS =================
    if (paymentStatus === "SUCCESS") {
      payment.status = "PAID";
      payment.transactionId = transactionId;
      await payment.save();

      if (booking) {
        await Session.findByIdAndUpdate(booking.session, {
          $pull: { lockedSeats: { seatNumber: booking.seatNumber } },
          $addToSet: { bookedSeats: booking.seatNumber },
        });
      }

      console.log("Payment SUCCESS:", orderId);
    }

    // ================= FAILED =================
    if (paymentStatus === "FAILED") {
      payment.status = "FAILED";
      await payment.save();

      if (booking) {
        await Session.findByIdAndUpdate(booking.session, {
          $pull: { lockedSeats: { seatNumber: booking.seatNumber } },
        });

        await Booking.findByIdAndDelete(booking._id);
      }

      console.log("Payment FAILED:", orderId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    res.sendStatus(500);
  }
};
