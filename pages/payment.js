import { useState } from "react";

export default function PaymentPage({ amount }) {
  const [method, setMethod] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);
  const [proof, setProof] = useState({ accountName: "", txnNumber: "", screenshot: null });

  const handleMethodSelect = (selected) => {
    setMethod(selected);
    if (selected !== "bank") alert("This method will be available soon!");
  };

  const handleBankConfirm = () => setShowBankForm(true);

  const handleProofChange = (e) => {
    setProof({ ...proof, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProof({ ...proof, screenshot: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Upload proof & redirect to /thankyou
  };

  return (
    <div className="payment-page">
      <h1>Payment Methods</h1>
      <button onClick={() => handleMethodSelect("jazzcash")}>JazzCash</button>
      <button onClick={() => handleMethodSelect("easypaisa")}>Easypaisa</button>
      <button onClick={() => handleMethodSelect("bank")}>Bank Transfer</button>

      {method === "bank" && !showBankForm && (
        <div>
          <p>Bank transfer details:</p>
          <p>JS Bank, NASPRO PRIVATE LIMITED, 0002810102</p>
          <p>Amount: PKR {amount}</p>
          <button onClick={handleBankConfirm}>I have completed the payment</button>
        </div>
      )}

      {showBankForm && (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>
            Bank Account Name:
            <input type="text" name="accountName" onChange={handleProofChange} required />
          </label>
          <label>
            Transaction Number:
            <input type="text" name="txnNumber" onChange={handleProofChange} required />
          </label>
          <label>
            Upload Screenshot:
            <input type="file" name="screenshot" onChange={handleFileChange} accept="image/*" required />
          </label>
          <button type="submit">Submit Payment Proof</button>
        </form>
      )}
    </div>
  );
        }
        
