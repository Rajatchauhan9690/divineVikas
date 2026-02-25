import { useState } from "react";
import { useLocation } from "react-router-dom";
import { createPaymentApi } from "../api/api";

export default function Checkout() {
  const location = useLocation();

  const sessionId = location.state?.sessionId;
  const seatNumber = location.state?.seatNumber;

  const amount = 149;

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      console.log("🚀 Payment process started");

      console.log("Session Data:", {
        sessionId,
        seatNumber,
      });

      if (!sessionId || seatNumber === undefined) {
        console.error("❌ Invalid booking session");
        alert("Invalid booking session");
        return;
      }

      setLoading(true);

      console.log("📡 Calling payment order API...");

      const paymentRes = await createPaymentApi({
        sessionId,
        seatNumber,
        amount,
      });

      console.log("✅ Payment API Response:", paymentRes);

      if (!paymentRes?.success) {
        throw new Error("Payment order creation failed");
      }

      console.log("💳 Opening Cashfree checkout gateway");

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      cashfree.checkout({
        paymentSessionId: paymentRes.payment_session_id,
        redirectTarget: "_self",
      });

      console.log("🎯 Checkout launched successfully");
    } catch (error) {
      console.error("🔥 Payment Initialization Error:", error);
      alert("Payment initialization failed");
    } finally {
      setLoading(false);
      console.log("🏁 Payment handler finished");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Payment Details</h2>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white bg-orange-500 hover:bg-orange-600"
        >
          {loading ? "Processing..." : `Proceed to Pay ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
