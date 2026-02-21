export default function Transform() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-4xl font-semibold mb-4">
          Transform all areas of your life
        </h2>

        <div className="w-16 h-1 bg-orange-500 mx-auto mb-16"></div>

        {/* Wheel */}
        <div className="relative w-[360px] h-[360px] mx-auto rounded-full shadow-md">
          {/* Quadrants */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-orange-500 rounded-tr-full flex flex-col items-center justify-center text-white">
            <span className="text-5xl font-bold">01</span>
            <span>WEALTH</span>
          </div>

          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-rose-600 rounded-br-full flex flex-col items-center justify-center text-white">
            <span className="text-5xl font-bold">02</span>
            <span>CAREER</span>
          </div>

          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-700 rounded-bl-full flex flex-col items-center justify-center text-white">
            <span className="text-5xl font-bold">03</span>
            <span>Relationship</span>
          </div>

          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-teal-500 rounded-tl-full flex flex-col items-center justify-center text-white">
            <span className="text-5xl font-bold">04</span>
            <span>HEALTH</span>
          </div>

          {/* Center Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center">
              {/* Outer ring */}
              <div className="w-28 h-28 rounded-full border-4 border-orange-500 flex items-center justify-center">
                {/* Brain Image */}
                <img
                  src="/Images/you.png" // 🔥 replace with your actual image path
                  alt="Brain"
                  className="w-25 h-20 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
