import { useState } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const [method, setMethod] = useState(null);
  const [proof, setProof] = useState({ transactionNumber: "", accountTitle: "", accountNumber: "", screenshot: null });
  const router = useRouter();

  // Handle JazzCash click
  const handleJazzCash = () => {
    alert("JazzCash payment is coming soon!");
  };

  // Handle Easypaisa click
  const handleEasypaisa = () => {
    alert("Easypaisa payment is coming soon!");
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setProof({ ...proof, screenshot: files[0] });
    } else {
      setProof({ ...proof, [name]: value });
    }
  };

  // Handle bank proof submission
  const handleBankSubmit = (e) => {
    e.preventDefault();
    if (!proof.transactionNumber || !proof.accountTitle || !proof.accountNumber || !proof.screenshot) {
      alert("Please complete all fields before submitting.");
      return;
    }
    // Normally you would send proof to server here
    alert("Payment proof submitted successfully!");
    router.push("/thankyou");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Choose Payment Method
        </h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleJazzCash}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow"
          >
            Pay with JazzCash (Coming Soon)
          </button>

          <button
            onClick={handleEasypaisa}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
          >
            Pay with Easypaisa (Coming Soon)
          </button>

          <button
            onClick={() => setMethod("bank")}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow"
          >
            Pay via Bank Transfer
          </button>
        </div>

        {/* Bank Transfer Details + Proof Form */}
        {method === "bank" && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">
              Bank Transfer Details
            </h3>
            <p className="text-gray-600">
              Bank Name: <b>JS Bank</b>
            </p>
            <p className="text-gray-600">
              Account Title: <b>NASPRO PRIVATE LIMITED</b>
            </p>
            <p className="text-gray-600">
              Account Number: <b>00028010102</b>
            </p>

            <form className="mt-4 flex flex-col gap-3" onSubmit={handleBankSubmit}>
              <input
                type="text"
                name="transactionNumber"
                placeholder="Transaction Number"
                value={proof.transactionNumber}
                onChange={handleChange}
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="accountTitle"
                placeholder="Account Title"
                value={proof.accountTitle}
                onChange={handleChange}
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={proof.accountNumber}
                onChange={handleChange}
                className="p-2 border rounded"
              />
              <input
                type="file"
                name="screenshot"
                accept="image/*"
                onChange={handleChange}
                className="p-2 border rounded"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
              >
                Submit Proof & Complete Payment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
                  }
                  
