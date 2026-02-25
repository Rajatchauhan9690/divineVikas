import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cancelBookingApi } from "../api/api";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasCancelled = useRef(false);

  const bookingId =
    new URLSearchParams(location.search).get("booking_id") ||
    location.state?.bookingId;

  useEffect(() => {
    console.log("PaymentFailed Page Loaded");

    if (!bookingId) {
      console.log("❌ Booking ID not found");
      return;
    }

    if (hasCancelled.current) {
      console.log("⚠️ Booking already cancelled, skipping API call");
      return;
    }

    const cancelBooking = async () => {
      try {
        hasCancelled.current = true;

        console.log("🔄 Cancelling booking for:", bookingId);

        const res = await cancelBookingApi({
          bookingId,
        });

        console.log("✅ Cancel booking response:", res);
      } catch (error) {
        console.error("❌ Cancel booking API error:", error);
      }
    };

    cancelBooking();
  }, [bookingId]);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-2xl text-red-600 mb-4">Payment Failed ❌</h2>

      <p className="mb-6 text-gray-600">Your seat has been released.</p>

      <button
        onClick={() => {
          console.log("👉 User clicked Try Again");
          navigate("/booking");
        }}
        className="bg-red-500 text-white px-6 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  );
}
