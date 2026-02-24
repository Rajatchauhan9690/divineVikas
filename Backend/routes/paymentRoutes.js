import express from "express";
import {
  createPayment,
  verifyPayment,
  cashfreeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayment);
router.post("/verify", verifyPayment);
router.post("/webhook", cashfreeWebhook);

export default router;
