// import { useLocation, useNavigate } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { createPaymentApi, verifyPaymentApi } from "../api/api";
// import { load } from "@cashfreepayments/cashfree-js";

// export default function Checkout() {
//   console.log("✅ Checkout Component Loaded");

//   const location = useLocation();
//   const navigate = useNavigate();

//   console.log("📌 Location State:", location.state);

//   const bookingId = location.state?.bookingId;
//   const sessionId = location.state?.sessionId;
//   const seatNumber = location.state?.seatNumber;
//   const amount = location.state?.amount || 149;

//   console.log("📌 Payment Data:", {
//     bookingId,
//     sessionId,
//     seatNumber,
//     amount,
//   });

//   const isMounted = useRef(true);
//   const navigatingRef = useRef(false);
//   const paymentLock = useRef(false);
//   const cashfreeRef = useRef(null);

//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     console.log("🚀 SDK Loader Triggered");

//     const initSDK = async () => {
//       try {
//         console.log("🔄 Loading Cashfree SDK...");
//         const cf = await load({ mode: "sandbox" });

//         console.log("✅ Cashfree SDK Loaded");
//         cashfreeRef.current = cf;
//       } catch (err) {
//         console.error("❌ SDK Load Error:", err);
//       }
//     };

//     initSDK();

//     return () => {
//       console.log("🧹 Checkout Component Unmounted");
//       isMounted.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     console.log("🔍 Validation Guard Running");

//     if (!bookingId || !sessionId || !seatNumber) {
//       console.warn("⚠ Missing booking/session/seat → Redirecting");
//       navigate("/booking", { replace: true });
//     }
//   }, []);

//   const safeNavigate = (path, state = {}) => {
//     console.log("🚀 Safe Navigate Called →", path);

//     if (navigatingRef.current) return;

//     navigatingRef.current = true;

//     setTimeout(() => {
//       console.log("➡ Navigating Now:", path);
//       navigate(path, { replace: true, state });
//     }, 50);
//   };

//   const pollPaymentStatus = async (bookingId, orderId) => {
//     console.log("🔄 Polling Payment Status...");

//     const start = Date.now();

//     while (Date.now() - start < 20000) {
//       try {
//         console.log("📡 Calling Verify API");

//         const res = await verifyPaymentApi({
//           bookingId,
//           orderId,
//         });

//         console.log("📩 Verify API Response:", res);

//         const status = res?.status || res?.payment_status || res?.data?.status;

//         console.log("💡 Parsed Status:", status);

//         if (status === "SUCCESS" || status === "PAID") {
//           console.log("🎉 Payment SUCCESS");
//           return "SUCCESS";
//         }

//         if (
//           status === "FAILED" ||
//           status === "CANCELLED" ||
//           status === "ERROR"
//         ) {
//           console.log("❌ Payment FAILED");
//           return "FAILED";
//         }
//       } catch (err) {
//         console.error("⚠ Poll Error:", err);
//       }

//       await new Promise((r) => setTimeout(r, 2000));
//     }

//     console.warn("⏳ Payment Polling Timed Out");
//     return "PENDING";
//   };

//   const handlePayment = async () => {
//     console.log("🟢 Payment Button Clicked");

//     if (!cashfreeRef.current) {
//       console.error("❌ Cashfree SDK not loaded");
//       return;
//     }

//     if (paymentLock.current) {
//       console.warn("⚠ Payment Locked");
//       return;
//     }

//     paymentLock.current = true;

//     try {
//       setLoading(true);

//       console.log("📤 Creating Payment Order...");

//       const res = await createPaymentApi({
//         bookingId,
//         sessionId,
//         seatNumber,
//         amount,
//       });

//       console.log("📩 Create Payment Response:", res);

//       if (!res?.payment_session_id || !res?.orderId) {
//         throw new Error("Payment initialization failed");
//       }

//       console.log("💳 Opening Cashfree Checkout");

//       await cashfreeRef.current.checkout({
//         paymentSessionId: res.payment_session_id,
//         redirectTarget: "_modal",
//       });

//       console.log("⏳ Checkout Closed → Starting Polling");

//       const result = await pollPaymentStatus(bookingId, res.orderId);

//       console.log("🏁 Poll Result:", result);

//       if (result === "SUCCESS") {
//         safeNavigate(`/payment-success/${bookingId}/${res.orderId}`);
//       } else {
//         safeNavigate("/payment-failed", {
//           state: { bookingId },
//         });
//       }
//     } catch (error) {
//       console.error("🔥 Payment Handler Error:", error);
//       safeNavigate("/payment-failed", { state: { bookingId } });
//     } finally {
//       if (isMounted.current) setLoading(false);
//     }
//   };

//   if (navigatingRef.current) {
//     console.log("⛔ Component Render Blocked Due To Navigation");
//     return null;
//   }

//   return (
//     <div className="h-screen flex justify-center items-center bg-gray-100">
//       <div className="p-6 shadow-lg rounded bg-white w-80">
//         <h2 className="text-xl font-bold mb-4 text-center">Checkout</h2>

//         <div className="mb-4 text-sm space-y-1">
//           <p>
//             <b>Booking ID:</b> {bookingId}
//           </p>
//           <p>
//             <b>Session ID:</b> {sessionId}
//           </p>
//           <p>
//             <b>Seat:</b> {seatNumber}
//           </p>
//           <p>
//             <b>Amount:</b> ₹{amount}
//           </p>
//         </div>

//         <button
//           onClick={handlePayment}
//           disabled={loading}
//           className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded transition"
//         >
//           {loading ? "Processing..." : `Pay ₹${amount}`}
//         </button>
//       </div>
//     </div>
//   );
// }

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPaymentApi } from "../api/api";
import { load } from "@cashfreepayments/cashfree-js";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const sessionId = location.state?.sessionId;
  const seatNumber = location.state?.seatNumber;
  const amount = location.state?.amount || 149;

  const cashfreeRef = useRef(null);
  const paymentLock = useRef(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load({ mode: "sandbox" }).then((cf) => {
      cashfreeRef.current = cf;
    });
  }, []);

  const handlePayment = async () => {
    if (!cashfreeRef.current || paymentLock.current) return;

    paymentLock.current = true;
    setLoading(true);

    try {
      const res = await createPaymentApi({
        bookingId,
        sessionId,
        seatNumber,
        amount,
      });

      if (!res.payment_session_id || !res.orderId) {
        throw new Error("Payment init failed");
      }

      await cashfreeRef.current.checkout({
        paymentSessionId: res.payment_session_id,
        redirectTarget: "_modal",
      });

      navigate(
        `/payment-success?order_id=${res.orderId}&booking_id=${bookingId}`,
      );
    } catch {
      navigate("/payment-failed", {
        state: { bookingId },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 shadow bg-white w-80 rounded">
        <h2 className="text-xl font-bold mb-4 text-center">Checkout</h2>

        <p className="mb-4 text-sm">
          Booking ID: {bookingId}
          <br />
          Seat: {seatNumber}
          <br />
          Amount: ₹{amount}
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-orange-500 text-white p-2 rounded"
        >
          {loading ? "Processing..." : `Pay ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
