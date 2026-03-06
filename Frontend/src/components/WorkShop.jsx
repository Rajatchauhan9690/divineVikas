import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function WorkShop() {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-6xl font-serif font-bold mb-20 text-slate-900 leading-tight"
        >
          Everything you need to achieve{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
            success
          </span>{" "}
          <br />
          is inside this workshop.
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Glass Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-10 md:p-12 border border-white/60 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl"></div>

            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6 relative z-10">
              Limited Seats To Maintain Healing Quality
            </h2>
            <p className="text-slate-600 text-lg mb-8 relative z-10">
              You will never need another person to relax and calm you after
              this session!
            </p>

            <div className="flex items-center gap-4 mb-10 bg-white/50 p-4 rounded-2xl border border-white/40">
              <Sparkles className="text-orange-500 w-8 h-8" />
              <p className="text-slate-800 text-lg">
                <strong className="text-orange-600 text-xl">1000+</strong> souls
                have already registered.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/booking")} // ✅ FIXED
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-5 px-6 text-xl font-bold transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group relative z-10"
            >
              SECURE YOUR SEAT
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-10">
              Your Journey Includes:
            </h3>

            <div className="space-y-6">
              {[
                "Removal of Success Blockers",
                "Shifting Energy Patterns",
                "Activation of Parasympathetic Nervous System",
                "Rewire Your Subconscious Mind",
                "Upgrade your Emotional Intelligence",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-5 glass-panel p-4 rounded-2xl"
                >
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-md">
                    ✓
                  </span>
                  <p className="text-slate-800 text-lg font-medium">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
