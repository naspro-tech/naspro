import { useState } from "react";

export default function PaymentPage() {
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJazzCash = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jazzcash-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1000, // 💰 replace with dynamic amount
          service: "Website Design", // 🔧 replace with dynamic service
          description: "Payment for Website Design",
          customer_name: "John Doe",
          customer_phone: "03123456789",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        // Build hidden form & auto-submit to JazzCash
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
        alert("❌ JazzCash Error: " + data.error);
      }
    } catch (err) {
      setLoading(false);
      console.error("JazzCash payment error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 font-inter">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Choose Payment Method
      </h1>

      <div className="space-y-4">
        {/* JazzCash Option */}
        <button
          onClick={handleJazzCash}
          disabled={loading}
          className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
        >
          {loading ? "Redirecting to JazzCash..." : "Pay with JazzCash"}
        </button>

        {/* Bank Transfer Option */}
        <button
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-md transition"
          onClick={() => setMethod("bank")}
        >
          Pay via Bank Transfer
        </button>
      </div>

      {/* Bank Transfer Details */}
      {method === "bank" && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            Bank Transfer Details
          </h2>
          <p>
            <strong>Bank Name:</strong> JS Bank
          </p>
          <p>
            <strong>Account Title:</strong> NASPRO PRIVATE LIMITED
          </p>
          <p>
            <strong>Account Number:</strong> 00028010102
          </p>
          <p className="mt-2 text-sm text-gray-600">
            After transferring, please send receipt to{" "}
            <b>naspropvt@gmail.com</b>
          </p>
          <button className="mt-4 w-full bg-[#ff6600] text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-[#e65c00]">
            I have completed the transaction
          </button>
        </div>
      )}
    </div>
  );
            }
