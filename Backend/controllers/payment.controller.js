import axios from "axios";
import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import Session from "../models/session.model.js";
import WebhookLog from "../models/webhookLog.model.js";
/*
=====================================
CREATE PAYMENT ORDER
=====================================
*/
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
    console.log("Request body:", req.body);

    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId });

    console.log("Payment record found:", !!payment);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    console.log("Current payment status:", payment.status);

    res.json({
      success: true,
      status: payment.status,
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("🔥 Verify Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};
/*
=====================================
WEBHOOK HANDLER (PRODUCTION STYLE)
=====================================
*/

export const cashfreeWebhook = async (req, res) => {
  let log = null;

  try {
    console.log("🔥 Cashfree webhook triggered");

    const event = req.body;

    console.log("Webhook payload:", JSON.stringify(event));

    /*
    =============================
    LOG WEBHOOK RECEIVED
    =============================
    */

    log = await WebhookLog.create({
      provider: "cashfree",
      payload: event,
      status: "RECEIVED",
    });

    console.log("Webhook log created:", log?._id);

    const orderId = event?.data?.order?.order_id;
    const transactionId = event?.data?.payment?.cf_payment_id;
    const paymentMethod = event?.data?.payment?.payment_method;

    console.log("Parsed webhook data:", {
      orderId,
      transactionId,
      paymentMethod,
    });

    if (!orderId) {
      console.log("❌ orderId missing in webhook");
      return res.sendStatus(400);
    }

    const payment = await Payment.findOne({ orderId }).populate("booking");

    console.log("Payment record found:", !!payment);

    if (!payment) return res.sendStatus(404);

    // Idempotency protection
    if (payment.status === "PAID") {
      console.log("⚠ Payment already processed");

      await WebhookLog.updateOne({ _id: log._id }, { status: "PROCESSED" });

      return res.sendStatus(200);
    }

    const booking = payment.booking;

    const orderStatus =
      event?.data?.order?.order_status || event?.data?.payment?.payment_status;

    console.log("Payment gateway status:", orderStatus);

    /*
    =============================
    PAYMENT SUCCESS
    =============================
    */

    if (["SUCCESS", "PAID", "COMPLETED"].includes(orderStatus)) {
      console.log("✅ Payment SUCCESS block executed");

      payment.status = "PAID";
      payment.transactionId = transactionId;
      payment.paymentMethod = paymentMethod;

      await payment.save();

      console.log("Payment record updated to PAID");

      await Session.findByIdAndUpdate(booking.session, {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
        $addToSet: {
          bookedSeats: booking.seatNumber,
        },
      });

      console.log("Session seat lock removed + booked seat added");

      await Booking.findByIdAndUpdate(booking._id, {
        status: "CONFIRMED",
      });

      console.log("Booking marked CONFIRMED:", booking._id);
    }

    /*
    =============================
    PAYMENT FAILED / EXPIRED
    =============================
    */

    if (orderStatus === "FAILED" || orderStatus === "EXPIRED") {
      console.log("❌ Payment FAILED or EXPIRED block executed");

      payment.status = "FAILED";

      await payment.save();

      await Session.findByIdAndUpdate(booking.session, {
        $pull: {
          lockedSeats: { seatNumber: booking.seatNumber },
        },
      });

      console.log("Session lock removed");

      await Booking.findByIdAndDelete(booking._id);

      console.log("Booking deleted:", booking._id);
    }

    /*
    =============================
    MARK WEBHOOK AS PROCESSED
    =============================
    */

    if (log) {
      await WebhookLog.updateOne({ _id: log._id }, { status: "PROCESSED" });

      console.log("Webhook log marked PROCESSED");
    }
    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("🔥 Webhook Error:", error.message);

    if (log) {
      await WebhookLog.updateOne(
        { _id: log._id },
        {
          status: "FAILED",
          errorMessage: error.message,
        },
      );
    }

    return res.sendStatus(500);
  }
};

// with cashree webhook secret
// export const cashfreeWebhook = async (req, res) => {
//   try {
//     const signature = req.headers["x-webhook-signature"];

//     if (!signature) return res.sendStatus(401);

//     const payload = JSON.stringify(req.body);

//     /*
//     ==============================
//     VERIFY WEBHOOK SIGNATURE
//     ==============================
//     */

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
//       .update(payload)
//       .digest("base64");

//     if (signature !== expectedSignature) {
//       console.log("❌ Webhook signature mismatch");
//       return res.sendStatus(401);
//     }

//     const event = req.body;

//     const orderId = event?.data?.order?.order_id;
//     const transactionId = event?.data?.payment?.cf_payment_id;

//     if (!orderId) return res.sendStatus(400);

//     /*
//     ==============================
//     FETCH PAYMENT RECORD
//     ==============================
//     */

//     const payment = await Payment.findOne({ orderId }).populate("booking");

//     if (!payment) return res.sendStatus(404);

//     /*
//     ==============================
//     IDEMPOTENCY CHECK
//     ==============================
//     */

//     if (payment.status === "PAID") return res.sendStatus(200);

//     const booking = payment.booking;

//     const orderStatus = event?.data?.payment?.payment_status;

//     /*
//     ==============================
//     PAYMENT SUCCESS
//     ==============================
//     */

//     if (orderStatus === "SUCCESS") {
//       payment.status = "PAID";
//       payment.transactionId = transactionId;
//       payment.paymentMethod = event?.data?.payment?.payment_method;

//       await payment.save();

//       await Session.findByIdAndUpdate(booking.session, {
//         $pull: {
//           lockedSeats: { seatNumber: booking.seatNumber },
//         },
//         $addToSet: {
//           bookedSeats: booking.seatNumber,
//         },
//       });

//       await Booking.findByIdAndUpdate(booking._id, {
//         status: "CONFIRMED",
//       });

//       console.log("✅ Payment confirmed:", orderId);
//     }

//     /*
//     ==============================
//     PAYMENT FAILED / EXPIRED
//     ==============================
//     */

//     if (orderStatus === "FAILED" || orderStatus === "EXPIRED") {
//       payment.status = "FAILED";

//       await payment.save();

//       await Session.findByIdAndUpdate(booking.session, {
//         $pull: {
//           lockedSeats: { seatNumber: booking.seatNumber },
//         },
//       });

//       await Booking.findByIdAndDelete(booking._id);

//       console.log("❌ Payment failed:", orderId);
//     }

//     return res.sendStatus(200);
//   } catch (error) {
//     console.error("❌ Webhook Error:", error.message);
//     return res.sendStatus(500);
//   }
// };
