// /pages/checkout.js
import { useState } from "react";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handlePayNow = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      amount: "3000000", // Rs 30,000.00 (last 2 digits are decimals)
      phone: "03123456789",
      cnic: "345678",
      description: "Web & App Development",
      billReference: "billRef123",
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // Create a hidden form and submit to JazzCash
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.jazzCashUrl;

        Object.entries(data.jazzCashRequest).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Payment initiation failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
      <h1>Checkout</h1>
      <p>Service: <b>Web & App Development</b></p>
      <p>Price: Rs 30,000.00</p>

      <button
        onClick={handlePayNow}
        disabled={loading}
        style={{
          backgroundColor: "#ff6600",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
