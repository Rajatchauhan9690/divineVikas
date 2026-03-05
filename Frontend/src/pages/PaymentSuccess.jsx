import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentApi, confirmBookingApi, getBookingApi } from "../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const bookingId = searchParams.get("booking_id");

  const retryRef = useRef(0);

  const [status, setStatus] = useState("VERIFYING");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!orderId || !bookingId) {
      navigate("/payment-failed");
      return;
    }

    const verifyAndConfirm = async () => {
      try {
        // 🔎 Step 1: Verify payment
        const verifyRes = await verifyPaymentApi({ orderId });

        if (
          verifyRes?.success ||
          verifyRes?.order_status === "PAID" ||
          verifyRes?.payment_status === "SUCCESS"
        ) {
          // 📌 Step 2: Confirm booking
          await confirmBookingApi({ bookingId });

          // 📥 Step 3: Fetch booking details
          const bookingRes = await getBookingApi(bookingId);

          if (!bookingRes?.success) {
            navigate("/payment-failed");
            return;
          }

          const data = bookingRes.data;

          setBooking({
            name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
            seat: data.seatNumber,
            slot: data.session?.time,
            date: data.session?.date,
            organizer: data.session?.name,
            amount: data.totalAmount,
          });

          setStatus("SUCCESS");
          return;
        }

        // 🔁 Retry verification (Cashfree sometimes delays)
        if (retryRef.current < 3) {
          retryRef.current++;
          setTimeout(verifyAndConfirm, 2000);
          return;
        }

        navigate("/payment-failed");
      } catch (error) {
        console.error("Verification error:", error);
        navigate("/payment-failed");
      }
    };

    verifyAndConfirm();
  }, [orderId, bookingId, navigate]);

  if (status === "VERIFYING") {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-green-600 text-center mb-6">
          Booking Confirmed 🎉
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Name:</strong> {booking.name}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Email:</strong> {booking.email}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Phone:</strong> {booking.phone}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Seat:</strong> {booking.seat}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Slot:</strong> {booking.slot}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <strong>Date:</strong>{" "}
            {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <strong>Organizer:</strong> {booking.organizer}
          </div>

          <div className="bg-green-100 p-4 rounded-lg md:col-span-2 text-center">
            <p className="text-xl font-bold text-green-700">
              Paid ₹{booking.amount}
            </p>
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
