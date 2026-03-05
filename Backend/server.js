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

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   }),
// );
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
