// /pages/payment.js
import { useState } from "react";

export default function PaymentPage() {
  const [service, setService] = useState("Basic Plan");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);

  const handleJazzCashPayment = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/jazzcash-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: `Payment for ${service}`,
          customer_name: "Test User",
          customer_phone: "03001234567",
          service,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Build a hidden form and auto-submit to JazzCash
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.jazzcash_url;

        Object.entries(data.form_data).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit(); // 🚀 Auto-submit to JazzCash
      } else {
        alert("Failed to initiate JazzCash payment: " + data.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Make a Payment</h1>

      <div className="mb-4">
        <label className="block mb-2">Service:</label>
        <input
          className="border p-2 w-full"
          value={service}
          onChange={(e) => setService(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Amount (PKR):</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      <button
        className="bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
        onClick={handleJazzCashPayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with JazzCash"}
      </button>
    </div>
  );
            }
          
