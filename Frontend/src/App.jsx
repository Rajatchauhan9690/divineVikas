import { BrowserRouter, Routes, Route } from "react-router-dom";

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

/* Toast */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentPending from "./pages/PaymentPending";

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={1500} />

      <BrowserRouter>
        <Routes>
          {/* Main Landing Page */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <LifeSection />
                <TransForm />
                <LifeWorkshop />
                <Personal />
                <WorkShop />
                <Testimonial />
                <FAQ />
                <StickyOffer />
              </>
            }
          />

          {/* Booking System Routes */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
