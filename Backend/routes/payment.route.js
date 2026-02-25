import express from "express";
import {
  createPayment,
  cashfreeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

/*
================================
PAYMENT ROUTES
================================
*/

router.post("/create", createPayment);
router.post("/webhook", cashfreeWebhook);

export default router;
