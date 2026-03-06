import { motion } from "framer-motion";

export default function LifeWorkshop() {
  const items = [
    {
      title: "Success Blockers",
      desc: "Remove the elements blocking you from achieving Extraordinary Success in your Career.",
      icon: "/Images/success.png",
    },
    {
      title: "Emotional Intelligence",
      desc: "Process and heal emotions without pain in your professional and personal life.",
      icon: "/Images/eint.png",
    },
    {
      title: "Shifting Energy",
      desc: "Vibrate at a Higher Frequency and Attract happiness into your life easily.",
      icon: "/Images/energy1.png",
    },
    {
      title: "Wealth Creation",
      desc: "Create an Abundance Mindset that helps you create massive wealth and Success.",
      icon: "/Images/mind.png",
    },
    {
      title: "Mental Plain Remedies",
      desc: "Perform strong remedies on the mental plain and get benefits in real life.",
      icon: "/Images/as.png",
    },
  ];

  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            What You Will Learn In The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
              Master Class
            </span>
          </h2>
          <p className="text-xl text-slate-600 font-light font-sans tracking-wide">
            Everything in the workshop is backed by the Universe.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* ✅ OPTIMIZED: The SVG line now animates automatically when it enters the screen, avoiding the heavy scroll-listener conflict */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-2 md:-ml-1 z-0">
            <svg
              className="absolute w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 10 100"
            >
              <line
                x1="5"
                y1="0"
                x2="5"
                y2="100"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <svg
              className="absolute w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 10 100"
            >
              <motion.line
                x1="5"
                y1="0"
                x2="5"
                y2="100"
                stroke="url(#gradient-line)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                viewport={{ once: true, margin: "-10%" }}
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
              />
              <defs>
                <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="space-y-16 md:space-y-24">
            {items.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`relative flex items-center md:justify-between flex-col md:flex-row ${isEven ? "md:flex-row-reverse" : ""}`}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="absolute left-8 md:left-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_0_15px_rgba(249,115,22,0.6)] transform -translate-x-1/2 z-10 border-4 border-white"
                  ></motion.div>

                  <div className="hidden md:block w-[45%]"></div>

                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    className="w-full pl-20 md:pl-0 md:w-[45%] group"
                  >
                    <div className="glass-panel rounded-3xl p-8 hover:bg-white/60 transition-colors duration-300 relative overflow-hidden">
                      <div className="bg-white/90 rounded-2xl w-20 h-20 p-4 mb-6 shadow-sm border border-orange-100 group-hover:scale-110 transition-transform duration-500">
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-sans text-lg">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
