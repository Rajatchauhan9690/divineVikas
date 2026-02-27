import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center">
        {/* Top Accent Bar */}
        <div className="h-2 w-16 bg-red-600 mx-auto rounded-full mb-6"></div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Payment Unsuccessful
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          We were unable to process your payment.
          <br />
          Your booking has been cancelled and the seat has been released. Please
          try again to complete your reservation.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/booking")}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition duration-200 shadow-md"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
