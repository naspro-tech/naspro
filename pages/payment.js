// /pages/payment.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const router = useRouter();
  const { service, amount, name, email, phone, cnic } = router.query;

  const [method, setMethod] = useState("");
  const [showBankForm, setShowBankForm] = useState(false);
  const [proof, setProof] = useState({ accountName: "", txnNumber: "", screenshot: null });
  const [errorMsg, setErrorMsg] = useState("");

  const handleMethodSelect = (selected) => {
    setMethod(selected);
    if (selected !== "bank") alert(`${selected} will be available soon!`);
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
    if (!proof.accountName || !proof.txnNumber || !proof.screenshot) {
      setErrorMsg("Please fill in all fields and upload screenshot.");
      return;
    }
    // Here you can send proof data to API if needed
    router.push("/thankyou");
  };

  return (
    <div style={container}>
      <h1 style={heading}>Payment for {service}</h1>
      <p><strong>Amount:</strong> PKR {amount}</p>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p><strong>CNIC:</strong> {cnic}</p>

      <h2 style={subHeading}>Select Payment Method</h2>
      <div style={buttonGroup}>
        <button style={button} onClick={() => handleMethodSelect("JazzCash")}>JazzCash</button>
        <button style={button} onClick={() => handleMethodSelect("Easypaisa")}>Easypaisa</button>
        <button style={button} onClick={() => handleMethodSelect("bank")}>Bank Transfer</button>
      </div>

      {method === "bank" && !showBankForm && (
        <div style={bankInfo}>
          <p><strong>Bank Name:</strong> JS Bank</p>
          <p><strong>Account Title:</strong> NASPRO PRIVATE LIMITED</p>
          <p><strong>Account Number:</strong> 0002810102</p>
          <p><strong>Amount:</strong> PKR {amount}</p>
          <button style={confirmButton} onClick={handleBankConfirm}>
            I have completed the payment
          </button>
        </div>
      )}

      {showBankForm && (
        <form onSubmit={handleSubmit} style={form} encType="multipart/form-data">
          <label style={label}>
            Bank Account Name:
            <input type="text" name="accountName" onChange={handleProofChange} required style={input} />
          </label>
          <label style={label}>
            Transaction Number:
            <input type="text" name="txnNumber" onChange={handleProofChange} required style={input} />
          </label>
          <label style={label}>
            Upload Screenshot:
            <input type="file" name="screenshot" onChange={handleFileChange} accept="image/*" required style={input} />
          </label>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          <button type="submit" style={submitButton}>Submit Payment Proof</button>
        </form>
      )}
    </div>
  );
}

const container = {
  maxWidth: 600,
  margin: "20px auto",
  padding: 20,
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  fontFamily: "sans-serif",
};

const heading = { fontSize: "1.5rem", marginBottom: 10 };
const subHeading = { fontSize: "1.2rem", marginTop: 20, marginBottom: 10 };
const buttonGroup = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 };
const button = {
  flex: 1,
  padding: 12,
  background: "#ff6600",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};
const bankInfo = { padding: 15, background: "#f9f9f9", borderRadius: 6, marginBottom: 20 };
const confirmButton = { ...button, marginTop: 10 };
const form = { display: "flex", flexDirection: "column", gap: 10 };
const label = { display: "flex", flexDirection: "column", fontWeight: 500 };
const input = { padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 5 };
const submitButton = { ...button, marginTop: 10 };
  
