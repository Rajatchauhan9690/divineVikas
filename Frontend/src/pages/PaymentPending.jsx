import { useNavigate } from "react-router-dom";

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">
        Payment Processing
      </h2>

      <p className="mb-6 text-gray-600">
        Your payment is being verified. Please wait...
      </p>

      <button
        onClick={() => navigate("/checkout")}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Return to Checkout
      </button>
    </div>
  );
}
