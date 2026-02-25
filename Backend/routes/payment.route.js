import express from "express";
import {
  createPayment,
  cashfreeWebhook,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

/*
================================
PAYMENT ROUTES
================================
*/

router.post("/create-payment", createPayment);
router.post("/verify-payment", verifyPayment);
router.post("/webhook", cashfreeWebhook);

export default router;
