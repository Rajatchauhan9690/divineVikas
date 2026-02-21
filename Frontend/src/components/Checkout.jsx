export default function Checkout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 p-6">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-bold">ONE DAY HEALING MASTER CLASS</h1>
          <p className="mt-2 text-gray-600">By DIVINE VIKAS</p>

          <h2 className="text-4xl font-bold mt-4">₹149</h2>

          <img
            src="https://via.placeholder.com/600x350"
            alt="Workshop"
            className="rounded-xl mt-6"
          />

          <div className="mt-6 space-y-3 text-gray-700">
            <p>📅 Start Date: Feb 14th, 2026, 9:30 a.m.</p>
            <p>🌐 Venue: This is a virtual event.</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white rounded-xl  p-6">
          <h2 className="text-xl font-semibold mb-4">Payment details</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="tel"
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-3"
            />

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Service</span>
                <span>₹149</span>
              </div>

              <div className="flex justify-between font-bold mt-2">
                <span>Amount to be paid</span>
                <span>₹149</span>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold">
              Proceed to pay ₹149 only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
