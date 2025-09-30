// pages/payment.js
import { useState } from "react";

export default function PaymentPage() {
  const [method, setMethod] = useState(null);

  const orderId = "ORDER123"; // TODO: Replace with real orderId from checkout
  const orderAmount = 1000; // TODO: Replace with real amount

  // 🔀 JazzCash payment
  async function handleJazzCashPayment() {
    try {
      const response = await fetch("/api/jazzcash-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderAmount,
          orderId: orderId,
          description: "Service Payment",
        }),
      });

      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      console.error("JazzCash Error:", error);
      alert("Something went wrong, please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Choose Payment Method
        </h2>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setMethod("jazzcash");
              handleJazzCashPayment();
            }}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow"
          >
            Pay with JazzCash
          </button>

          <button
            onClick={() => setMethod("bank")}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow"
          >
            Pay via Bank Transfer
          </button>
        </div>

        {/* Bank Transfer Details */}
        {method === "bank" && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">
              Bank Transfer Details
            </h3>
            <p className="text-gray-600">Bank Name: <b>JS Bank</b></p>
            <p className="text-gray-600">Account Title: <b>NASPRO PRIVATE LIMITED</b></p>
            <p className="text-gray-600">Account Number: <b>00028010102</b></p>

            <button
              className="mt-4 w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
              onClick={() => alert("Redirect to proof upload form...")}
            >
              I Have Completed the Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
          }
