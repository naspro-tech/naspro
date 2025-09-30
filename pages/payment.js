import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const [method, setMethod] = useState(null); // jazzcash / easypaisa / bank
  const [bankStep, setBankStep] = useState(0); // 0 = show details, 1 = submit proof
  const [proof, setProof] = useState({ transactionNumber: "", accountTitle: "", accountNumber: "", screenshot: null });
  const [order, setOrder] = useState({
    service: "",
    amount: 0,
    name: "",
    email: "",
    phone: "",
    cnic: "",
    description: "",
  });

  const router = useRouter();
  const { service, amount, name, email, phone, cnic, description } = router.query;

  // Populate order details from query params
  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, cnic, description });
    }
  }, [service, amount, name, email, phone, cnic, description]);

  // Payment handlers
  const handleJazzCash = () => alert("JazzCash payment is coming soon!");
  const handleEasypaisa = () => alert("Easypaisa payment is coming soon!");
  const handleBankStep1 = () => setBankStep(1);

  // Bank proof form change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setProof({ ...proof, screenshot: files[0] });
    else setProof({ ...proof, [name]: value });
  };

  // Bank proof submission
  const handleBankSubmit = (e) => {
    e.preventDefault();
    if (!proof.transactionNumber || !proof.accountTitle || !proof.accountNumber || !proof.screenshot) {
      alert("Please complete all fields before submitting.");
      return;
    }
    alert("Payment proof submitted successfully!");
    router.push("/thankyou");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Choose Payment Method</h2>

        <p className="text-center text-gray-700 mb-6">
          Service: <b>{order.service}</b> | Amount: <b>PKR {Number(order.amount).toLocaleString()}</b>
        </p>

        <div className="flex flex-col gap-4">
          <button onClick={handleJazzCash} className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md">
            Pay with JazzCash (Coming Soon)
          </button>

          <button onClick={handleEasypaisa} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md">
            Pay with Easypaisa (Coming Soon)
          </button>

          <button onClick={() => setMethod("bank")} className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl shadow-md">
            Pay via Bank Transfer
          </button>
        </div>

        {/* Bank Transfer Step 1: Show details */}
        {method === "bank" && bankStep === 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Bank Transfer Details</h3>
            <p className="text-gray-600">Bank Name: <b>JS Bank</b></p>
            <p className="text-gray-600">Account Title: <b>NASPRO PRIVATE LIMITED</b></p>
            <p className="text-gray-600">Account Number: <b>00028010102</b></p>

            <button onClick={handleBankStep1} className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md">
              I Have Completed the Payment
            </button>
          </div>
        )}

        {/* Bank Transfer Step 2: Submit proof */}
        {method === "bank" && bankStep === 1 && (
          <form className="mt-6 flex flex-col gap-3" onSubmit={handleBankSubmit}>
            <h3 className="font-semibold text-lg text-gray-700 mb-2">Submit Payment Proof</h3>
            <input type="text" name="transactionNumber" placeholder="Transaction Number" value={proof.transactionNumber} onChange={handleChange} className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            <input type="text" name="accountTitle" placeholder="Account Title" value={proof.accountTitle} onChange={handleChange} className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            <input type="text" name="accountNumber" placeholder="Account Number" value={proof.accountNumber} onChange={handleChange} className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            <input type="file" name="screenshot" accept="image/*" onChange={handleChange} className="p-2 border rounded-md"/>
            <button type="submit" className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md">
              Submit Proof & Complete Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
    }
    
