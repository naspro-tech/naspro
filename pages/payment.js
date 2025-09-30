// /pages/payment.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const [method, setMethod] = useState(null);
  const [proof, setProof] = useState(null);
  const router = useRouter();

  const handleJazzCash = () => {
    router.push("/api/jazzcash-payment");
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();

    if (!proof) {
      alert("Please upload payment proof first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", proof);

    const res = await fetch("/api/upload-proof", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("✅ Proof submitted successfully! We will verify and contact you.");
      router.push("/thankyou?payment_method=bank_transfer");
    } else {
      alert("❌ Failed to submit proof. Try again.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Choose Payment Method</h1>

      <div className="space-y-4">
        {/* JazzCash Option */}
        <button
          className="w-full bg-purple-600 text-white px-6 py-3 rounded shadow hover:bg-purple-700"
          onClick={handleJazzCash}
        >
          Pay with JazzCash
        </button>

        {/* Bank Transfer Option */}
        <button
          className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded shadow hover:bg-gray-300"
          onClick={() => setMethod("bank")}
        >
          Pay via Bank Transfer
        </button>
      </div>

      {method === "bank" && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Bank Transfer Details</h2>
          <p><strong>Bank Name:</strong> JS Bank</p>
          <p><strong>Account Title:</strong> NASPRO PRIVATE LIMITED</p>
          <p><strong>Account Number:</strong> 00028010102</p>
          <p className="mt-2 text-sm text-gray-600">
            After transferring, please upload your payment proof below:
          </p>

          {/* Proof Upload Form */}
          <form onSubmit={handleProofSubmit} className="mt-4 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProof(e.target.files[0])}
              className="block w-full text-sm"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
            >
              I have completed the payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
                }
