import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPaymentApi, createBookingApi } from "../api/api";
import { load } from "@cashfreepayments/cashfree-js";
import { toast } from "react-toastify";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  console.log("Location State:", location.state);

  const sessionId = location.state?.sessionId;
  const seatNumber = location.state?.seatNumber || "";
  const amount = location.state?.amount || 0;
  const organizerName = location.state?.organizerName || "Organizer";
  const slotTime = location.state?.slotTime || "N/A";

  console.log("SessionId:", sessionId);
  console.log("SeatNumber:", seatNumber);
  console.log("Amount:", amount);

  const cashfreeRef = useRef(null);
  const paymentLock = useRef(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load Cashfree SDK
  useEffect(() => {
    console.log("Loading Cashfree SDK...");

    load({ mode: "sandbox" }).then((cf) => {
      console.log("Cashfree SDK Loaded:", cf);
      cashfreeRef.current = cf;
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log("Input Changed:", name, value);

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handlePayment = async () => {
    console.log("Payment Button Clicked");

    if (!form.name || !form.email || !form.phone) {
      toast.error("Fill all customer details");
      return;
    }

    if (!cashfreeRef.current) {
      console.log("Cashfree SDK not ready");
      return;
    }

    if (paymentLock.current) {
      console.log("Payment already processing");
      return;
    }

    paymentLock.current = true;
    setLoading(true);

    try {
      // Clean phone number
      const cleanPhone = form.phone.replace(/^0+/, "");

      const bookingPayload = {
        sessionId,
        seatNumber,
        pricePerSeat: amount,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: cleanPhone,
      };

      console.log("Booking Payload:", bookingPayload);

      const bookingRes = await createBookingApi(bookingPayload);

      console.log("Booking API Response:", bookingRes);

      if (!bookingRes?.bookingId) {
        throw new Error("Booking creation failed");
      }

      const bookingId = bookingRes.bookingId;

      console.log("Booking ID:", bookingId);

      const paymentPayload = {
        bookingId,
        amount,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: cleanPhone,
      };

      console.log("Payment Payload:", paymentPayload);

      const paymentRes = await createPaymentApi(paymentPayload);

      console.log("Payment API Response:", paymentRes);

      if (!paymentRes?.payment_session_id) {
        throw new Error("Payment initialization failed");
      }

      console.log("Starting Cashfree Checkout");

      await cashfreeRef.current.checkout({
        paymentSessionId: paymentRes.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Payment Error:", error);
      navigate("/payment-failed");
    } finally {
      console.log("Resetting payment state");

      setLoading(false);
      paymentLock.current = false;
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Booking Info */}
        <div className="md:w-1/2 bg-orange-50 p-6 space-y-3">
          <h2 className="text-2xl font-bold text-orange-600 text-center">
            Booking Details
          </h2>

          <p>
            <strong>Organizer:</strong> {organizerName}
          </p>
          <p>
            <strong>Slot Time:</strong> {slotTime}
          </p>
          <p>
            <strong>Seat No:</strong> {seatNumber}
          </p>

          <div className="pt-3 border-t">
            <p className="text-sm text-gray-500">Seat Price</p>
            <p className="text-xl font-bold text-green-600">₹{amount}</p>
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
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <input
              name="phone"
              placeholder="Phone Number"
              maxLength={10}
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phone: value });
              }}
              className="w-full border p-2 rounded"
            />

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full p-3 rounded text-white font-medium transition ${
                loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Processing..." : `Pay ₹${amount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
