// PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentApi } from "../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");

  const name = searchParams.get("name") || "N/A";
  const email = searchParams.get("email") || "N/A";
  const seat = searchParams.get("seat") || "N/A";
  const slot = searchParams.get("slot") || "N/A";
  const organizer = searchParams.get("organizer") || "N/A";

  const [status, setStatus] = useState("VERIFYING");

  useEffect(() => {
    if (!orderId) return;

    let retry = 0;

    const verifyPayment = async () => {
      try {
        const res = await verifyPaymentApi({ orderId });

        if (res?.status === "PAID") {
          setStatus("SUCCESS");
          return;
        }

        if (res?.status === "PENDING" && retry < 3) {
          retry++;
          setTimeout(verifyPayment, 2000);
          return;
        }

        setStatus("FAILED");
      } catch {
        setStatus("FAILED");
      }
    };

    verifyPayment();
  }, [orderId]);

  if (status === "VERIFYING") {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-red-600 text-2xl font-bold mb-4">
            Payment Failed ❌
          </h2>

          <button
            onClick={() => navigate("/booking")}
            className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
          Booking Confirmed 🎉
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-gray-700 text-sm md:text-base">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Name:</strong> {name}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Email:</strong> {email}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Seat No:</strong> {seat}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Slot Time:</strong> {slot}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <p>
              <strong>Organizer:</strong> {organizer}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg md:col-span-2 text-center">
            <p className="text-green-700 font-semibold">
              Payment received successfully. Your booking is confirmed.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 transition text-white px-8 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
