import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

/* Pages */
import LandingPage3D from "./pages/LandingPage3d"; // ✅ NEW: The 3D Master Wrapper
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

// Protected Route Wrapper
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
};

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />

      <BrowserRouter>
        <Routes>
          {/* ✅ REPLACED: The entire landing page is now a 3D WebGL installation */}
          <Route path="/" element={<LandingPage3D />} />

          {/* Booking System Routes */}
          <Route
            path="/booking"
            element={
              <div className="bg-mesh min-h-screen">
                <BookingPage />
              </div>
            }
          />

          {/* Secured Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Payment Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
