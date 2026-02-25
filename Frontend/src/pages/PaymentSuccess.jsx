import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPaymentApi } from "../api/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState("VERIFYING");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await verifyPaymentApi({ orderId });

        console.log("Verify payment response:", res);

        // if (res.status === "PAID" || res.success)
        if (res?.status === "PAID") {
          setStatus("SUCCESS");
        } else {
          setStatus("FAILED");
        }
      } catch (error) {
        console.error(error);
        setStatus("FAILED");
      }
    };

    if (orderId) verifyPayment();
  }, [orderId]);

  if (status === "VERIFYING") {
    return <h2>Verifying Payment...</h2>;
  }

  if (status === "FAILED") {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="text-red-600 text-2xl">Payment Failed ❌</h2>
        <button
          onClick={() => navigate("/booking")}
          className="bg-red-500 text-white px-6 py-2 rounded mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-green-600 text-2xl">Booking Confirmed 🎉</h2>

      <button
        onClick={() => navigate("/")}
        className="bg-green-500 text-white px-6 py-2 rounded mt-4"
      >
        Go Home
      </button>
    </div>
  );
}
