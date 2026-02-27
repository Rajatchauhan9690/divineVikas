import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentApi, confirmBookingApi } from "../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const bookingId = searchParams.get("booking_id");

  const name = searchParams.get("name") || "N/A";
  const email = searchParams.get("email") || "N/A";
  const seat = searchParams.get("seat") || "N/A";
  const slot = searchParams.get("slot") || "N/A";
  const organizer = searchParams.get("organizer") || "N/A";
  const amount = searchParams.get("amount") || "0";

  const retryRef = useRef(0);
  const [status, setStatus] = useState("VERIFYING");

  useEffect(() => {
    if (!orderId || !bookingId) return;

    const verifyAndConfirm = async () => {
      try {
        const res = await verifyPaymentApi({ orderId });

        if (res?.success) {
          await confirmBookingApi({ bookingId });

          setStatus("SUCCESS");
          return;
        }

        if (retryRef.current < 3) {
          retryRef.current++;
          setTimeout(verifyAndConfirm, 2000);
          return;
        }

        navigate("/payment-failed");
      } catch {
        navigate("/payment-failed");
      }
    };

    verifyAndConfirm();
  }, [orderId, bookingId]);

  if (status === "VERIFYING") {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
          Booking Confirmed 🎉
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Name:</strong> {name}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Email:</strong> {email}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Seat:</strong> {seat}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Slot:</strong> {slot}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <strong>Organizer:</strong> {organizer}
          </div>

          <div className="bg-green-100 p-4 rounded-lg md:col-span-2 text-center">
            <p className="text-xl font-bold text-green-700">Paid ₹{amount}</p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
