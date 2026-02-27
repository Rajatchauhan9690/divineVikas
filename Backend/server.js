import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";

import bookingRoutes from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.route.js";
import sessionRoutes from "./routes/session.route.js";

import { initSocket } from "./socket/socket.js";

import { startLockCleanerWorker } from "./workers/lockCleaner.worker.js";

dotenv.config();

/*
========================================
DATABASE CONNECTION
========================================
*/

connectDB();

/*
========================================
APP INITIALIZATION
========================================
*/

const app = express();
const server = http.createServer(app);

/*
========================================
MIDDLEWARE
========================================
*/

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // "https://divine-vikas-gcm4.vercel.app",
      // "https://www.divinevikas.com",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
========================================
ROUTES
========================================
*/

app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/session", sessionRoutes);

/*
========================================
SOCKET + WORKER START
========================================
*/

initSocket(server);
startLockCleanerWorker();

/*
========================================
SERVER START
========================================
*/

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
