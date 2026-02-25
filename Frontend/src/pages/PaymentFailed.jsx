import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { cancelBookingApi } from "../api/api";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("booking_id");

  useEffect(() => {
    const cancel = async () => {
      if (bookingId) {
        await cancelBookingApi({ bookingId });
      }
    };

    cancel();
  }, [bookingId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-red-600">❌ Payment Failed</h2>

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}
