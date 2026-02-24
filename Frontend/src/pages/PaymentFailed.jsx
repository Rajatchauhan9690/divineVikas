import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600">❌ Payment Failed</h2>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
