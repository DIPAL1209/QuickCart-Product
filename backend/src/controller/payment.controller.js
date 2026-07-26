const Razorpay = require("razorpay");
const crypto = require("crypto");
const supabase = require('../config/db'); // adjust path as per your project

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1: Called AFTER your order is created in DB with status "pending"
// Creates a Razorpay order linked to your internal order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body; // amount in rupees from your DB order

    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: "orderId and amount are required" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay needs paise (integer)
      currency: "INR",
 receipt: orderId.slice(0, 40),
      notes: { internal_order_id: orderId },
    });

    // Save razorpay_order_id against your internal order for later verification
    await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", orderId);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, // safe to expose, needed on frontend
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

// Step 2: Called by frontend after user completes payment on Razorpay checkout
// Verifies signature to confirm payment is genuine, then marks order "paid"
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Mark order as failed if signature doesn't match — don't trust the client blindly
      await supabase
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderId);

      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Signature valid → payment is genuine, update order + store transaction details
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};