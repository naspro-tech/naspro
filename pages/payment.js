import { useState } from "react";

export default function PaymentPage() {
  const [method, setMethod] = useState(null);

  const handleJazzCash = async () => {
    const res = await fetch("/api/jazzcash-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000,
        service: "Web Development",
        customer_name: "Test User",
        customer_phone: "03123456789",
        description: "Testing payment"
      }),
    });

    const data = await res.json();

    if (data.success) {
      // Build hidden form and auto-submit
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
      form.submit();
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Choose Payment Method</h1>

      <button
        onClick={handleJazzCash}
        className="bg-orange-500 text-white px-4 py-2 rounded-lg"
      >
        Pay with JazzCash
      </button>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Bank Transfer</h2>
        <p>Bank Name: JS Bank</p>
        <p>Account Title: NASPRO PRIVATE LIMITED</p>
        <p>Account Number: 00028010102</p>
        <button className="mt-3 bg-green-600 text-white px-3 py-1 rounded">
          I have completed the transaction
        </button>
      </div>
    </div>
  );
}
