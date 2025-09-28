// /pages/checkout.js
import { useState } from "react";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    const txnDateTime = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const body = {
      amount: "3000000", // in paisa (PKR 30,000.00)
      txnDateTime,
      txnExpiryDateTime: expiryDateTime,
      phone: "03123456789",
      cnic: "345678",
      billReference: "billRef123",
      description: "Testing",
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      const jazzcashUrl =
        "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = jazzcashUrl;

      Object.entries(result.payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } else {
      alert("Payment initiation failed: " + result.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        {loading ? "Processing..." : "Pay with JazzCash"}
      </button>
    </div>
  );
}
