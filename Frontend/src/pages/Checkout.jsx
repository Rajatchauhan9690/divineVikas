import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { createPaymentApi, createBookingApi } from "../api/api";
import { load } from "@cashfreepayments/cashfree-js";
import { toast } from "react-toastify";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // If someone tries to access /checkout directly without selecting a seat, send them back
  if (!location.state) {
    return <Navigate to="/booking" replace />;
  }

  const { sessionId, seatNumber, amount, organizerName, slotTime } =
    location.state;

  const cashfreeRef = useRef(null);
  const paymentLock = useRef(false);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Name, 2: Email, 3: Phone, 4: Payment
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load Cashfree SDK in the background
  useEffect(() => {
    load({ mode: "sandbox" }).then((cf) => {
      cashfreeRef.current = cf;
    });
  }, []);

  // Validation & Progression Logic
  const handleNext = () => {
    setError("");
    if (step === 1 && form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (step === 3 && form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep((prev) => prev - 1);
    else navigate("/booking"); // Go back to seat selection
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  // Final Payment Execution
  const handlePayment = async () => {
    if (!cashfreeRef.current) {
      toast.error("Payment system initializing, please wait a second.");
      return;
    }

    if (paymentLock.current) return;

    paymentLock.current = true;
    setLoading(true);

    try {
      const cleanPhone = form.phone.replace(/^0+/, "");

      // 1. Create Booking in Database
      const bookingPayload = {
        sessionId,
        seatNumber,
        pricePerSeat: amount,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: cleanPhone,
      };

      const bookingRes = await createBookingApi(bookingPayload);
      if (!bookingRes?.bookingId) throw new Error("Booking creation failed");

      // 2. Initialize Payment Session
      const paymentPayload = {
        bookingId: bookingRes.bookingId,
        amount,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: cleanPhone,
      };

      const paymentRes = await createPaymentApi(paymentPayload);
      if (!paymentRes?.payment_session_id)
        throw new Error("Payment initialization failed");

      // 3. Trigger Cashfree Popup
      await cashfreeRef.current.checkout({
        paymentSessionId: paymentRes.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Payment Error:", error);
      navigate("/payment-failed");
    } finally {
      setLoading(false);
      paymentLock.current = false;
    }
  };

  // Animation variants for smooth transitions
  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-slate-950 text-white selection:bg-orange-500 selection:text-white">
      {/* Immersive Dark Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        />
      </div>

      {/* Navigation Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
        <button
          onClick={handleBack}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} /> {step === 1 ? "Cancel Booking" : "Back"}
        </button>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Lock size={14} /> Secure Checkout
        </div>
      </div>

      {/* Main Conversational Area */}
      <div className="w-full max-w-2xl px-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: NAME */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              <h1 className="text-3xl md:text-5xl font-serif font-light text-slate-200">
                What is your name?
              </h1>
              <input
                autoFocus
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b-2 border-slate-700 text-3xl md:text-4xl py-4 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
              />
            </motion.div>
          )}

          {/* STEP 2: EMAIL */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              <h1 className="text-3xl md:text-5xl font-serif font-light text-slate-200 leading-tight">
                Beautiful. Where should we send your access link,{" "}
                <span className="text-orange-400 font-bold">
                  {form.name.split(" ")[0]}
                </span>
                ?
              </h1>
              <input
                autoFocus
                type="email"
                placeholder="hello@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b-2 border-slate-700 text-3xl md:text-4xl py-4 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
              />
            </motion.div>
          )}

          {/* STEP 3: PHONE */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
              <h1 className="text-3xl md:text-5xl font-serif font-light text-slate-200">
                And your WhatsApp number for a gentle reminder?
              </h1>
              <input
                autoFocus
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b-2 border-slate-700 text-3xl md:text-4xl py-4 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-700"
              />
            </motion.div>
          )}

          {/* STEP 4: REVIEW & PAY */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              <Sparkles className="text-orange-500 w-12 h-12 mb-6" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                Your sanctuary awaits.
              </h1>
              <p className="text-slate-400 mb-10">
                Review your details and secure your energy exchange.
              </p>

              {/* Glass Ticket Summary */}
              <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-left mb-8 shadow-2xl">
                <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      Session
                    </p>
                    <p className="text-xl font-bold">{slotTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      Seat
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      No. {seatNumber}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={16} className="text-orange-500" />{" "}
                    {form.name}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={16} className="text-orange-500" />{" "}
                    {form.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={16} className="text-orange-500" /> +91{" "}
                    {form.phone}
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`relative overflow-hidden w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-5 rounded-2xl text-xl font-bold shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>PAY ₹{amount} SECURELY</span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message & Advance Button (Only for Steps 1-3) */}
        {step < 4 && (
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-rose-500 font-medium h-6">{error}</p>

            <button
              onClick={handleNext}
              className="bg-white text-slate-950 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              Press Enter <span className="text-xl">↵</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
