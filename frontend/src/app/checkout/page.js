"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Cookies from "js-cookie";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, LayoutGrid, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clearCart } = useCart();

  const [step, setStep] = useState("form");
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = async () => {
    setStep("processing");
    setErrorMsg("");

    try {
      const token = Cookies.get("access_token");

      const orderRes = await fetch("http://localhost:5000/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setErrorMsg(orderData.message || "Could not create order");
        setStep("failed");
        return;
      }

      const internalOrderId = orderData.order.id;
      const amount = orderData.order.total_amount ?? total;

      const payRes = await fetch("http://localhost:5000/api/v1/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: internalOrderId, amount }),
      });
      const payData = await payRes.json();

      if (!payData.success) {
        setErrorMsg("Payment initialization failed");
        setStep("failed");
        return;
      }

      const options = {
        key: payData.key,
        amount: payData.amount,
        currency: payData.currency,
        order_id: payData.razorpayOrderId,
        name: "QuickCart",
        description: `Order #${internalOrderId}`,
        handler: async function (response) {
          const verifyRes = await fetch("http://localhost:5000/api/v1/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: internalOrderId,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setReceipt({
              txnId: response.razorpay_payment_id,
              amount,
              date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            });
            clearCart();
            setStep("success");
          } else {
            setStep("failed");
          }
        },
        modal: {
          ondismiss: () => setStep("form"),
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => setStep("failed"));
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStep("failed");
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-black/50">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen w-full bg-[#F6F3EA] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {step === "form" && (
            <div className="rounded-2xl bg-white border border-black/10 p-6">
              <h2 className="font-bold text-xl mb-1">Order Summary</h2>
              <p className="text-black/50 text-sm mb-4">{cart.length} item(s)</p>
              <div className="border-t border-black/10 pt-4 mb-5">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button
                onClick={handlePay}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition"
              >
                <ShieldCheck size={16} /> Pay ₹{total}
              </button>
              <p className="text-center text-[11px] text-black/40 mt-3">Secured by Razorpay</p>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-16">
              <span className="inline-block w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-4" />
              <p className="text-black/60">Opening secure payment window...</p>
            </div>
          )}

          {step === "success" && receipt && (
            <div className="rounded-2xl bg-white border border-black/10 p-6 text-center">
              <CheckCircle2 size={48} className="text-green-600 mx-auto mb-3" />
              <h2 className="font-bold text-xl mb-1">Payment Successful!</h2>
              <p className="text-black/50 text-sm mb-4">Your order has been confirmed.</p>
              <div className="bg-[#F6F3EA] rounded-xl p-4 text-left text-sm space-y-2 mb-4">
                <div className="flex justify-between"><span className="text-black/50">Transaction ID</span><span className="font-semibold">{receipt.txnId}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Amount</span><span className="font-semibold">₹{receipt.amount}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Date</span><span className="font-semibold">{receipt.date}</span></div>
              </div>
              <button
                onClick={() => router.push("/orders")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-[#2563EB] text-white"
              >
                <LayoutGrid size={16} /> View My Orders
              </button>
            </div>
          )}

          {step === "failed" && (
            <div className="rounded-2xl bg-white border border-black/10 p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">Payment failed or cancelled</p>
              {errorMsg && <p className="text-black/40 text-xs mb-3">{errorMsg}</p>}
              <button onClick={() => setStep("form")} className="w-full py-3 rounded-xl font-semibold bg-black/5">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}