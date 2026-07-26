const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require("../../controller/payment.controller");
const authMiddleware = require("../../middleware/auth.middleware");

router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;