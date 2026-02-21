import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(300);
  const [toastMessage, setToastMessage] = useState("");

  const navigate = useNavigate();

  const users = [
    "Rajat",
    "Aman",
    "Priya",
    "Neha",
    "Arjun",
    "Simran",
    "Karan",
    "Anjali",
    "Rahul",
    "Pooja",
    "Vikram",
    "Sneha",
    "Aditya",
    "Kavya",
    "Rohit",
    "Isha",
    "Manish",
    "Nikita",
    "Sahil",
    "Megha",
    "Yash",
    "Tanya",
  ];

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // Toast Notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      setToastMessage(`${randomUser} has joined`);

      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full overflow-hidden">
      {/* ================= HERO TOP BANNER ================= */}
      <div className="bg-orange-500 text-white text-center rounded-b-2xl px-4 py-4 md:py-6 mx-4 md:mx-10">
        <h1 className="text-[16px] leading-tight font-bold md:text-4xl md:leading-snug max-w-3xl mx-auto">
          One Day Whole Body Healing Master Class
        </h1>

        <p className="mt-2 text-[14px] md:text-lg max-w-2xl mx-auto">
          Heal Deeply | Transform Gently | Learn Easily
        </p>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="bg-white px-4 py-10 space-y-16">
        {/* ===== Heading Section ===== */}
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm md:text-base text-gray-600 font-medium">
            Feeling Stuck, Drained or overwhelmed? or want to explore cosmos?
          </p>

          <p className="mt-2 text-orange-500 font-semibold tracking-wide">
            Acknowledge everything here!
          </p>

          <h2 className="mt-4 text-xl md:text-4xl font-extrabold text-black leading-snug">
            Experience Powerful Holistic Method Of Healing{" "}
            <span className="text-orange-500">That Works On The </span>
            Mind, Body, Emotions And Energy Systems{" "}
            <span className="text-orange-500">
              Release Blockages, Restore Balance.
            </span>
          </h2>

          <p className="mt-4 text-gray-700 text-sm md:text-lg">
            Using the energy of <strong>Cosmos,</strong>
            <strong>You and Me</strong>
          </p>
        </div>

        {/* ===== Image + Benefits Section ===== */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-lg overflow-hidden w-full h-60 md:h-[350px] lg:h-[400px]">
            <img
              src="/Images/myphoto.png"
              alt="Workshop Video"
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-gray-100 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl md:text-2xl font-extrabold text-black mb-6">
              Why You Will Get In One Day?
            </h3>

            <ul className="space-y-4">
              {[
                "Understanding whole body healing and energy alignment",
                "Guided healing session for stress, anxiety, emotional heaviness & fatigue",
                "Activation of self-healing awareness",
                "Techniques to calm the nervous system and balance energy flow",
                "Feeling of lightness, clarity, and inner stability",
                "Better understanding of your healing needs",
              ].map((text, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 bg-white p-4 rounded-xl"
                >
                  <span className="bg-orange-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold flex-shrink-0">
                    ✓
                  </span>
                  <p className="text-gray-800 text-sm md:text-base font-medium">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== Profile + CTA Section ===== */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          {/* Left */}
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-2xl p-6 flex gap-4 items-center">
              <img
                src="/Images/myphoto.png"
                alt="Dr. Vikas Chauhan"
                className="w-20 h-20 rounded-full border-4 border-orange-400 object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-600">
                  I will be the one <strong>to help you</strong>
                </p>
                <h3 className="text-lg md:text-xl font-extrabold text-black">
                  VIKAS CHAUHAN
                </h3>
                <p className="text-orange-500 font-semibold text-sm">
                  Guided Meditation Expert, Akashic Reader, Astrology Aspirant
                </p>
                <p className="text-sm text-gray-600">
                  Learned from best mentors and real life experiences
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 flex items-center gap-4">
              <div className="text-yellow-400 text-lg">★★★★★</div>
              <p className="text-sm md:text-base text-gray-800 font-medium">
                High Rated Meditation Facilitator <strong>4.95 Stars</strong> by{" "}
                <strong>1000+ participants</strong>
              </p>
            </div>
          </div>

          {/* Right CTA */}
          <div className="text-center space-y-5">
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-white py-4 rounded-full text-lg font-extrabold"
              onClick={() => navigate("/booking")}
            >
              JOIN NOW
            </button>

            <p className="text-sm md:text-base text-gray-700">
              Grab your Success Roadmap in <strong>just 5 minutes</strong>
            </p>

            <p className="text-sm md:text-base text-gray-700">
              WORKSHOP STARTS ON <strong>14th Feb 2026</strong> (9:30 PM)
            </p>

            <h4 className="text-lg md:text-xl font-extrabold text-black">
              Register In Next{" "}
              <span className="text-orange-500">
                {minutes}:{seconds}
              </span>{" "}
              Min
            </h4>

            <div className="flex justify-center gap-6">
              <div className="bg-gray-100 rounded-xl px-6 py-4 w-28">
                <p className="text-3xl font-extrabold text-black">{minutes}</p>
                <p className="text-xs text-gray-600 mt-1">MINUTES</p>
              </div>

              <div className="bg-gray-100 rounded-xl px-6 py-4 w-28">
                <p className="text-3xl font-extrabold text-black">{seconds}</p>
                <p className="text-xs text-gray-600 mt-1">SECONDS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TOAST ================= */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white text-black px-4 py-3 rounded-lg shadow-lg text-sm md:text-base font-semibold animate-fadeIn">
            {toastMessage}
          </div>
        </div>
      )}
    </section>
  );
}
