import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Hero from "./components/Hero";
import Testimonial from "./components/Testimonial";
import FAQ from "./components/FAQ";
import WorkShop from "./components/WorkShop";
import TransForm from "./components/Transform";
import LifeWorkshop from "./components/LifeWorkshop";
import Personal from "./components/Personal";
import LifeSection from "./components/LifeSection";
import StickyOffer from "./components/StickyOffer";
import Checkout from "./pages/Checkout";

/* Booking System Pages */
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import AdminLogin from "./pages/AdminLogin"; // ✅ New Import

/* Toast */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

// ✅ Protected Route Wrapper: Checks for the token before rendering the AdminPage
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
};

// Inside Frontend/src/App.jsx
// ... (keep your existing imports) ...

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />

      <BrowserRouter>
        <Routes>
          {/* Main Landing Page Wrapped in the Energy Mesh */}
          <Route
            path="/"
            element={
              <div className="bg-mesh min-h-screen text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
                <Hero />
                <LifeSection />
                <TransForm />
                <LifeWorkshop />
                <Personal />
                <WorkShop />
                <Testimonial />
                <FAQ />
                <StickyOffer />
              </div>
            }
          />

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
