import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentApi } from "../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const verify = async () => {
      try {
        if (!orderId) {
          setMessage("Invalid payment session.");
          return;
        }

        const res = await verifyPaymentApi({ orderId });

        if (res.success) {
          setMessage("🎉 Payment Successful & Seat Confirmed!");
        } else {
          setMessage("Payment failed or pending.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{message}</h2>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
