import React, { useState, useRef, useEffect } from "react";

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Jane Doe",
      title: "CEO",
      quote: "Working with this team has been an absolute pleasure.",
    },
    {
      id: 2,
      name: "John Smith",
      title: "Director",
      quote: "The results exceeded our expectations! Fantastic service!",
    },
    {
      id: 3,
      name: "Emily White",
      title: "Founder",
      quote: "Professional, efficient, and incredibly insightful.",
    },
    {
      id: 4,
      name: "Michael B.",
      title: "Manager",
      quote: "Our experience was seamless from start to finish.",
    },
    {
      id: 5,
      name: "Sophia Lee",
      title: "Designer",
      quote: "Simply the best! They understood our vision perfectly.",
    },
    {
      id: 6,
      name: "David G.",
      title: "Head Ops",
      quote: "An outstanding partner for any business growth.",
    },
    {
      id: 7,
      name: "Olivia M.",
      title: "Project Lead",
      quote: "Highly responsive and willing to go the extra mile.",
    },
    {
      id: 8,
      name: "Daniel W.",
      title: "CTO",
      quote: "Their team is genuinely passionate about quality.",
    },
  ];

  // Clone first and last slide
  const extendedSlides = [
    testimonials[testimonials.length - 1],
    ...testimonials,
    testimonials[0],
  ];

  const [currentIndex, setCurrentIndex] = useState(1);
  const [transition, setTransition] = useState(true);
  const sliderRef = useRef();

  const nextSlide = () => {
    if (currentIndex >= extendedSlides.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
  };

  // Infinite effect
  useEffect(() => {
    const slider = sliderRef.current;

    const handleTransitionEnd = () => {
      if (currentIndex === extendedSlides.length - 1) {
        setTransition(false);
        setCurrentIndex(1);
      }
      if (currentIndex === 0) {
        setTransition(false);
        setCurrentIndex(extendedSlides.length - 2);
      }
    };

    slider.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      slider.removeEventListener("transitionend", handleTransitionEnd);
  }, [currentIndex, extendedSlides.length]);

  useEffect(() => {
    if (!transition) {
      requestAnimationFrame(() => setTransition(true));
    }
  }, [transition]);

  // Touch Handlers
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) =>
    (touchStartX.current = e.targetTouches[0].clientX);
  const handleTouchMove = (e) =>
    (touchEndX.current = e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) nextSlide();
    if (touchEndX.current - touchStartX.current > 50) prevSlide();
  };

  return (
    <section className="relative w-full bg-gray-100 py-10 md:py-10 flex items-center justify-center ">
      <div className="w-full max-w-4xl px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-10">
          What People Say
        </h2>

        <div className="relative">
          {/* Slider */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={sliderRef}
              className="flex"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: transition
                  ? "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
                willChange: "transform",
              }}
            >
              {extendedSlides.map((item, index) => (
                <div
                  key={index}
                  className="min-w-full flex justify-center px-2"
                >
                  <div className="bg-white rounded-3xl p-6 md:p-12 w-full max-w-3xl min-h-[260px] md:min-h-[350px] flex flex-col justify-center items-center ">
                    <p className="text-base md:text-xl italic text-gray-700 mb-6 md:mb-8 leading-relaxed">
                      "{item.quote}"
                    </p>

                    <div>
                      <h4 className="text-lg md:text-xl font-bold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-medium text-sm md:text-base">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 bg-white w-10 h-10 md:w-14 md:h-14 items-center justify-center rounded-full text-xl md:text-2xl font-bold hover:scale-110 transition-transform duration-300"
          >
            ←
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 bg-white w-10 h-10 md:w-14 md:h-14 items-center justify-center rounded-full text-xl md:text-2xl font-bold hover:scale-110 transition-transform duration-300"
          >
            →
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-6 md:mt-8 gap-2 md:gap-3">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  i === currentIndex - 1
                    ? "bg-white w-6 md:w-8"
                    : "bg-gray-300 w-2 md:w-3"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
