import { useState } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { service, amount, name, email, phone, cnic, description } = router.query;

  const [method, setMethod] = useState("");
  const [proof, setProof] = useState({ txnNumber: "", accountName: "", accountNumber: "", screenshot: null });
  const [showBankDetails, setShowBankDetails] = useState(false);

  const handlePaymentMethod = (m) => {
    if (m === "bank") setShowBankDetails(true);
    else alert(`${m} payment method will be available soon.`);
    setMethod(m);
  };

  const handleProofChange = (e) => {
    setProof({ ...proof, [e.target.name]: e.target.files ? e.target.files[0] : e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!proof.txnNumber || !proof.accountName || !proof.accountNumber || !proof.screenshot) {
      alert("Please fill all payment proof details and upload screenshot.");
      return;
    }

    // Serialize proof to pass via query params
    router.push({
      pathname: "/thankyou",
      query: {
        service,
        amount,
        name,
        email,
        phone,
        cnic,
        description,
        method,
        proof: JSON.stringify({
          ...proof,
          screenshot: proof.screenshot.name, // only pass file name
        }),
      },
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h1>Payment</h1>
      <p><strong>Service:</strong> {service}</p>
      <p><strong>Amount:</strong> PKR {amount}</p>

      <h3>Select Payment Method:</h3>
      <button onClick={() => handlePaymentMethod("bank")}>Bank Transfer</button>
      <button onClick={() => handlePaymentMethod("easypaisa")}>Easypaisa</button>
      <button onClick={() => handlePaymentMethod("jazzcash")}>JazzCash</button>

      {showBankDetails && (
        <div style={{ marginTop: 20 }}>
          <h3>Bank Details</h3>
          <p>Bank Name: JS Bank</p>
          <p>Account Title: NASPRO PRIVATE LIMITED</p>
          <p>Account Number: 0002810102</p>
          <p>Please complete your payment and submit proof below.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 15 }}>
            <input name="txnNumber" placeholder="Transaction Number" value={proof.txnNumber} onChange={handleProofChange} required />
            <input name="accountName" placeholder="Bank Account Name" value={proof.accountName} onChange={handleProofChange} required />
            <input name="accountNumber" placeholder="Bank Account Number" value={proof.accountNumber} onChange={handleProofChange} required />
            <input type="file" name="screenshot" onChange={handleProofChange} required />
            <button type="submit">I Have Completed Payment</button>
          </form>
        </div>
      )}
    </div>
  );
        }
        
