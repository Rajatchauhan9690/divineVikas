import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import EnergyCore from "./EnergyCore";

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(300);
  const [liveSouls, setLiveSouls] = useState(42);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Simulate live presence
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSouls((prev) => {
        const shift = Math.random() > 0.5 ? 1 : -1;
        return Math.max(30, Math.min(80, prev + shift));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const listContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const listItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Social Proof Pulse Indicator */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white/60 backdrop-blur-md px-4 py-2 shadow-lg border border-white/40"
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </div>
        <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          <Users size={16} className="text-orange-500" />
          {liveSouls} souls are healing with you
        </span>
      </motion.div>

      {/* TOP BANNER */}
      <div className="relative z-10 bg-orange-500/90 backdrop-blur-sm text-white text-center rounded-b-3xl px-4 py-5 mx-4 md:mx-10 shadow-lg border border-orange-400/50">
        <h1 className="text-[16px] leading-tight font-serif font-bold md:text-4xl md:leading-snug max-w-3xl mx-auto">
          One Day Whole Body Healing Master Class
        </h1>
        <p className="mt-2 text-[14px] md:text-lg max-w-2xl mx-auto font-light tracking-wide">
          Heal Deeply | Transform Gently | Learn Easily
        </p>
      </div>

      <div className="relative z-10 px-4 py-16 space-y-20">
        {/* Heading Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-sm md:text-base text-gray-600 font-medium tracking-widest uppercase">
            Feeling Stuck, Drained or overwhelmed?
          </p>
          <h2 className="mt-6 text-2xl md:text-5xl font-serif font-extrabold text-slate-900 leading-tight">
            Experience the Holistic Method of Healing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              That Restores The Mind, Body & Energy.
            </span>
          </h2>
          <p className="mt-6 text-gray-600 text-sm md:text-lg font-light">
            Using the energy of <strong>Cosmos, You and Me.</strong>
          </p>
        </motion.div>

        {/* 3D Core + Benefits Section */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden w-full h-[400px] md:h-[500px] shadow-2xl relative border border-slate-700/50 flex items-center justify-center bg-slate-950"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.2)_0%,transparent_70%)] pointer-events-none z-0"></div>
            <EnergyCore />
          </motion.div>

          <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 md:p-10 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8">
              What You Will Experience
            </h3>
            <motion.ul
              variants={listContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                "Understanding whole body healing and energy alignment",
                "Guided healing session for emotional heaviness & fatigue",
                "Activation of self-healing awareness",
                "Techniques to calm the nervous system",
                "Feeling of lightness, clarity, and inner stability",
              ].map((text, index) => (
                <motion.li
                  key={index}
                  variants={listItem}
                  className="flex items-start gap-4 bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm"
                >
                  <span className="bg-gradient-to-br from-orange-400 to-rose-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold flex-shrink-0 shadow-md">
                    ✓
                  </span>
                  <p className="text-slate-800 text-sm md:text-base font-medium pt-1">
                    {text}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* Profile + CTA Section */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl p-6 flex gap-6 items-center shadow-lg">
              <img
                src="/Images/myphoto.png"
                alt="Dr. Vikas Chauhan"
                className="w-24 h-24 rounded-full border-4 border-orange-400 object-cover flex-shrink-0 shadow-inner"
              />
              <div>
                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                  Your Guide
                </p>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                  VIKAS CHAUHAN
                </h3>
                <p className="text-orange-600 font-medium text-sm mt-1">
                  Guided Meditation Expert • Akashic Reader
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-6 bg-white/50 backdrop-blur-lg border border-white/60 p-8 rounded-3xl shadow-xl"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-5 rounded-2xl text-xl font-bold shadow-lg shadow-orange-500/30 border border-orange-400/50"
              onClick={() => (window.location.href = "/booking")}
            >
              SECURE YOUR SPOT
            </motion.button>
            <div className="flex justify-center gap-6 pt-4">
              <div className="bg-white/80 rounded-2xl px-6 py-4 w-28 shadow-sm border border-slate-100">
                <p className="text-3xl font-bold text-slate-800">{minutes}</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  MINUTES
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl px-6 py-4 w-28 shadow-sm border border-slate-100">
                <p className="text-3xl font-bold text-slate-800">{seconds}</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  SECONDS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
