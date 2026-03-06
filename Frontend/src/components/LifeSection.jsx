import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function LifeSection() {
  const items = [
    "Feel emotionally stuck, drained, or overwhelmed",
    "Are dealing with stress, anxiety, or unresolved emotions",
    "Want natural, healing support",
    "Are curious about energy healing but unsure where to start",
    "Want to experience healing before committing fully",
    "Are ready to perform remedies on mental plain due to lack of time",
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <section className="w-full py-20 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">
            Who Is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              This
            </span>{" "}
            For?
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-orange-400 to-rose-500 mx-auto mt-6 rounded-full" />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="glass-panel rounded-3xl p-6 md:p-12 space-y-5"
        >
          {items.map((text, index) => (
            <motion.div
              key={index}
              variants={itemAnim}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-5 bg-white/60 hover:bg-white/80 transition-colors rounded-2xl p-5 border border-white/50 shadow-sm"
            >
              <CheckCircle2 className="text-orange-500 w-8 h-8 flex-shrink-0" />
              <p className="text-slate-800 text-lg md:text-xl font-medium">
                {text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
