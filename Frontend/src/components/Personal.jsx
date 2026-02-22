import React from "react";

const images = [
  { src: "/Images/yoga.png", alt: "People sitting on mountain" },
  { src: "/Images/happy family.png", alt: "Couple at sunset" },
  { src: "/Images/businessmen.png", alt: "Businessmen meeting" },
  { src: "/Images/couple.png", alt: "Couple enjoying outdoors" },
];

export default function Personal() {
  return (
    <section className="w-full bg-white pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            This could be <span className="text-orange-500">your life..</span>
          </h2>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden w-full h-64 md:h-80 lg:h-96"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
