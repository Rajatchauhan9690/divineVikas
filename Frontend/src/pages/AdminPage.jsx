import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Add slot
  const handleAddSlot = async () => {
    if (!time) return alert("Enter slot time");

    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ time }),
      });

      setTime("");
      fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete slot
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slot?")) return;

    try {
      await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });

      fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Admin Slot Management
      </h1>

      {/* Add Slot Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Slot</h2>

        <div className="flex gap-3">
          <input
            className="flex-1 border p-3 rounded-lg"
            placeholder="Enter slot time (e.g. 10:00 AM)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            onClick={handleAddSlot}
            className="bg-green-600 text-white px-6 rounded-lg hover:bg-green-700 transition"
          >
            Add Slot
          </button>
        </div>
      </div>

      {/* Slot List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Slots</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div
              key={slot._id}
              className={`p-4 rounded-lg border relative ${
                slot.booked ? "bg-red-100" : "bg-green-50"
              }`}
            >
              <p className="font-semibold">{slot.time}</p>

              <p className="text-sm mt-1">
                Status:{" "}
                <span className="font-medium">
                  {slot.booked ? "Booked" : "Available"}
                </span>
              </p>

              <button
                onClick={() => handleDelete(slot._id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
