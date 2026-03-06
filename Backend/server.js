import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import { initIO } from "./socket/socket.js";
import connectDB from "./config/db.js";

import paymentRoutes from "./routes/payment.route.js";
import sessionRoutes from "./routes/session.route.js";
import bookingRoutes from "./routes/booking.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();

// 1. Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Crucial for sockets and cookies
  }),
);
app.use(express.json());

// 2. Wrap Express with the HTTP Server
const server = http.createServer(app);

// 3. Initialize Socket.io BEFORE defining routes
initIO(server);

// 4. API Routes
app.use("/api/payment", paymentRoutes);
// ✅ FIX: Changed from "/api/sessions" to "/api/session" to match frontend
app.use("/api/session", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Divine Vikas API is running...");
});

// 5. Connect Database and Start Server
const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    // Call .listen on 'server', NOT 'app'
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
