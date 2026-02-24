import { useState } from "react";
import { createPaymentApi } from "../api/api";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const amount = 149;
  const bookingId = "YOUR_BOOKING_ID"; // Replace with real bookingId

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create payment order from backend
      const data = await createPaymentApi({
        bookingId,
        amount,
      });

      if (!data.success) {
        alert("Order creation failed");
        return;
      }

      // 2️⃣ Initialize Cashfree
      const cashfree = window.Cashfree({
        mode: "sandbox", // change to "production" in live
      });

      // 3️⃣ Open Cashfree Checkout
      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self", // Cashfree will handle redirect
      });
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 p-6">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-bold">ONE DAY HEALING MASTER CLASS</h1>
          <p className="mt-2 text-gray-600">By DIVINE VIKAS</p>

          <h2 className="text-4xl font-bold mt-4">₹{amount}</h2>

          <img
            src="https://via.placeholder.com/600x350"
            alt="Workshop"
            className="rounded-xl mt-6"
          />

          <div className="mt-6 space-y-3 text-gray-700">
            <p>📅 Start Date: Feb 14th, 2026, 9:30 a.m.</p>
            <p>🌐 Venue: This is a virtual event.</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Payment details</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="tel"
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-3"
            />

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Service</span>
                <span>₹{amount}</span>
              </div>

              <div className="flex justify-between font-bold mt-2">
                <span>Amount to be paid</span>
                <span>₹{amount}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-lg font-semibold text-white 
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
            >
              {loading ? "Processing..." : `Proceed to pay ₹${amount} only`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
