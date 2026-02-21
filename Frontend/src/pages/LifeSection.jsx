import React from "react";

export default function LifeSection() {
  const items = [
    {
      bold: "Feel emotionally stuck, drained, or overwhelmed",
    },
    {
      bold: "Are dealing with stress, anxiety, or unresolved emotions",
    },
    {
      bold: "Want natural, healing support",
    },
    {
      bold: "Are curious about energy healing but unsure where to start",
    },
    {
      bold: "Want to experience healing before committing healing to yourself",
    },
    {
      bold: "Are ready to perform remedies on mental plain due to lack of time",
    },
  ];

  return (
    <section className="w-full bg-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Who Is <span className="text-orange-500">this</span> for?
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Card Wrapper */}
        <div className="bg-gray-100 rounded-2xl p-6 md:p-10">
          <div className="space-y-5">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white rounded-xl p-5"
              >
                {/* Check Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <span className="text-orange-500 text-lg">✓</span>
                </div>

                {/* Text */}
                <p className="text-gray-800 text-lg">
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
