import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./pages/Hero";
import Testimonial from "./pages/Testimonial";
import FAQ from "./pages/FAQ";
import WorkShop from "./pages/WorkShop";
import TransForm from "./pages/Transform";
import LifeWorkshop from "./pages/LifeWorkshop";
import Personal from "./pages/Personal";
import LifeSection from "./pages/LifeSection";
import StickyOffer from "./pages/StickyOffer";
import Checkout from "./pages/Checkout";

/* Booking System Pages */
import BookingPage from "./components/booking/BookingPage";
import AdminPage from "./pages/AdminPage";

/* Toast */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

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
        </Routes>
      </BrowserRouter>
    </>
  );
}
