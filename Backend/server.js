import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { initSocket } from "./socket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.divinevikas.com",
      "https://divine-vikas-gcm4.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
