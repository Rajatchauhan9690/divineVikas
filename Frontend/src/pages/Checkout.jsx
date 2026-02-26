// Checkout.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPaymentApi } from "../api/api";
import { load } from "@cashfreepayments/cashfree-js";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = location.state?.bookingId;
  const sessionId = location.state?.sessionId;

  const seatNumber = location.state?.seatNumber || "";
  const amount = location.state?.amount || 149;
  const organizerName = location.state?.organizerName || "Organizer";
  const slotTime = location.state?.slotTime || "N/A";

  const cashfreeRef = useRef(null);
  const paymentLock = useRef(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    seatNo: seatNumber,
  });

  useEffect(() => {
    load({ mode: "sandbox" }).then((cf) => {
      cashfreeRef.current = cf;
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!cashfreeRef.current || paymentLock.current) return;

    paymentLock.current = true;
    setLoading(true);

    try {
      const res = await createPaymentApi({
        bookingId,
        sessionId,
        seatNumber: form.seatNo,
        amount,
        customerName: form.name,
        customerEmail: form.email,
      });

      if (!res?.payment_session_id || !res?.orderId) {
        throw new Error("Payment init failed");
      }

      await cashfreeRef.current.checkout({
        paymentSessionId: res.payment_session_id,
        redirectTarget: "_modal",
      });

      navigate(
        `/payment-success?order_id=${res.orderId}&name=${encodeURIComponent(
          form.name,
        )}&email=${encodeURIComponent(form.email)}&seat=${encodeURIComponent(
          form.seatNo,
        )}&slot=${encodeURIComponent(slotTime)}&organizer=${encodeURIComponent(
          organizerName,
        )}`,
      );
    } catch {
      navigate("/payment-failed", {
        state: { bookingId },
      });
    } finally {
      setLoading(false);
      paymentLock.current = false;
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Booking Details */}
        <div className="md:w-1/2 bg-orange-50 p-6 space-y-3">
          <h2 className="text-2xl font-bold text-orange-600 text-center mb-4">
            Booking Details
          </h2>

          <div className="space-y-2 text-gray-700 text-sm md:text-base">
            <p>
              <strong>Organizer:</strong> {organizerName}
            </p>
            <p>
              <strong>Slot Time:</strong> {slotTime}
            </p>
            <p>
              <strong>Seat No:</strong> {seatNumber}
            </p>

            <p className="text-lg font-semibold text-green-600">
              Amount: ₹{amount}
            </p>
          </div>
        </div>

        {/* Customer Form */}
        <div className="md:w-1/2 p-6 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-center mb-6">
            Customer Details
          </h2>

          <div className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 transition p-3 rounded text-white font-medium"
            >
              {loading ? "Processing..." : `Pay ₹${amount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
