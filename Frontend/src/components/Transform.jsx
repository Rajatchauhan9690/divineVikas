import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quadrants = [
  {
    id: 1,
    label: "WEALTH",
    color: "bg-orange-500",
    text: "Align your energy to attract abundance without friction.",
  },
  {
    id: 2,
    label: "CAREER",
    color: "bg-rose-600",
    text: "Clear subconscious blocks halting your professional growth.",
  },
  {
    id: 3,
    label: "RELATIONS",
    color: "bg-slate-700",
    text: "Heal past wounds to foster deep, meaningful connections.",
  },
  {
    id: 4,
    label: "HEALTH",
    color: "bg-teal-500",
    text: "Release stored trauma and restore physiological balance.",
  },
];

export default function Transform() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);

  return (
    <section className="bg-slate-50 py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6"
        >
          Transform Every Pillar of Your Life
        </motion.h2>

        <div className="w-20 h-1.5 bg-gradient-to-r from-orange-400 to-rose-500 mx-auto mb-20 rounded-full"></div>

        {/* Interactive Mandala Wheel */}
        <div className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px] mx-auto group">
          {/* Base Glow */}
          <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-3xl scale-110 -z-10 transition-all duration-700 group-hover:bg-rose-500/30"></div>

          {quadrants.map((q, i) => {
            const isHovered = hoveredIndex === i;
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

            // Positioning for 4 corners mapping to a circle
            const positions = [
              "top-0 right-0 rounded-tr-full",
              "bottom-0 right-0 rounded-br-full",
              "bottom-0 left-0 rounded-bl-full",
              "top-0 left-0 rounded-tl-full",
            ];

            return (
              <motion.div
                key={q.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedInsight(q)}
                animate={{
                  opacity: isDimmed ? 0.4 : 1,
                  scale: isHovered ? 1.05 : 1,
                }}
                className={`absolute w-[49%] h-[49%] cursor-pointer ${q.color} ${positions[i]} flex flex-col items-center justify-center text-white shadow-lg border border-white/20 transition-all duration-300 z-10`}
              >
                <span className="text-3xl md:text-5xl font-black opacity-30">
                  0{q.id}
                </span>
                <span className="font-bold tracking-widest text-sm md:text-base mt-2">
                  {q.label}
                </span>
              </motion.div>
            );
          })}

          {/* Center Core */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div
              animate={{
                scale: hoveredIndex !== null ? 1.1 : 1,
                boxShadow:
                  hoveredIndex !== null
                    ? "0 0 40px rgba(249, 115, 22, 0.6)"
                    : "0 0 20px rgba(0,0,0,0.1)",
              }}
              className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center border-4 border-slate-50 transition-all duration-500"
            >
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/Images/you.png"
                  alt="You"
                  className={`w-20 h-20 md:w-24 md:h-24 object-contain transition-transform duration-700 ${hoveredIndex !== null ? "scale-110 drop-shadow-lg" : ""}`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Insight Modal (Popup) */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInsight(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setSelectedInsight(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
              <div
                className={`w-12 h-12 rounded-full ${selectedInsight.color} mb-6 flex items-center justify-center text-white font-bold text-xl`}
              >
                0{selectedInsight.id}
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                {selectedInsight.label}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {selectedInsight.text}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
