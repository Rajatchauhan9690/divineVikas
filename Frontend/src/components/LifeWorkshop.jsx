export default function LifeWorkshop() {
  const items = [
    {
      title: "Success Blockers",
      desc: "How to remove the elements that are blocking you from achieving Extraordinary Success in your Career.",
      icon: "/Images/success.png",
    },
    {
      title: "Upgrade your Emotional Intelligence",
      desc: "How to process and heal the emotions without pain in your professional and personal life.",
      icon: "/Images/eint.png",
    },
    {
      title: "Shifting Energy Patterns",
      desc: "How to vibrate at a Higher Frequency and Attract happiness into your life easily.",
      icon: "/Images/energy1.png",
    },
    {
      title: "Wealth Creation",
      desc: "How to create an Abundance Mindset that helps you create massive wealth and Success.",
      icon: "/Images/mind.png",
    },
    {
      title: "Remedies On Mental Plain",
      desc: "How to perform strong remedies on mental plain and get the benefits in real life.",
      icon: "/Images/as.png",
    },
  ];

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Heading */}
        <h2 className="text-center text-4xl font-semibold mb-6">
          What You Will Learn In The{" "}
          <span className="text-orange-500">One Day Healing Master Class</span>
        </h2>

        {/* Subheading */}
        <p className="text-center text-xl text-gray-800 m-8">
          Everything in the workshop is backed by Universe
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-2xl p-8 flex gap-6 items-start"
            >
              {/* Icon */}
              <div className="bg-white rounded-xl  min-w-20 min-h-20 flex items-center justify-center">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
