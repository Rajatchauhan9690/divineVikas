import express from "express";
import {
  createPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { cashfreeWebhook } from "../controllers/webhook.controller.js"; // ✅ New Import

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/verify-payment", verifyPayment);

// ✅ The Webhook Endpoint
router.post("/webhook", cashfreeWebhook);

export default router;
