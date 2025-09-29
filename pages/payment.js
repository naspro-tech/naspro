import { useState } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { service, amount } = router.query;

  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [proof, setProof] = useState({ txnNo: "", accountName: "", accountNumber: "", screenshot: null });

  const handleMethodSelect = (method) => {
    if (method === "jazzcash" || method === "easypaisa") {
      alert("This payment method will be available soon!");
      return;
    }
    setSelectedMethod(method);
  };

  const handleProofChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "screenshot") {
      setProof((prev) => ({ ...prev, screenshot: files[0] }));
    } else {
      setProof((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitProof = () => {
    // Normally here you would send proof to your backend
    router.push(`/thankyou?service=${service}&amount=${amount}`);
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 15 }}>Payment - {service}</h1>
      <p><strong>Amount:</strong> PKR {amount}</p>

      {!selectedMethod && (
        <div style={{ marginTop: 20 }}>
          <h3>Select Payment Method:</h3>
          <button style={buttonStyle} onClick={() => handleMethodSelect("bank")}>Bank Transfer</button>
          <button style={buttonStyle} onClick={() => handleMethodSelect("jazzcash")}>JazzCash</button>
          <button style={buttonStyle} onClick={() => handleMethodSelect("easypaisa")}>Easypaisa</button>
        </div>
      )}

      {selectedMethod === "bank" && !paymentDone && (
        <div style={{ marginTop: 20 }}>
          <h3>Bank Transfer Details:</h3>
          <p><strong>Bank Name:</strong> JS Bank</p>
          <p><strong>Account Title:</strong> NASPRO PRIVATE LIMITED</p>
          <p><strong>Account Number:</strong> 0002810102</p>
          <button style={buttonStyle} onClick={() => setPaymentDone(true)}>I have completed the payment</button>
        </div>
      )}

      {paymentDone && (
        <div style={{ marginTop: 20 }}>
          <h3>Submit Payment Proof:</h3>
          <label>
            Transaction Number*:
            <input type="text" name="txnNo" value={proof.txnNo} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label>
            Account Name*:
            <input type="text" name="accountName" value={proof.accountName} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label>
            Account Number*:
            <input type="text" name="accountNumber" value={proof.accountNumber} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label>
            Upload Screenshot*:
            <input type="file" name="screenshot" onChange={handleProofChange} style={inputStyle} />
          </label>
          <button style={buttonStyle} onClick={handleSubmitProof}>Submit Proof</button>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 600,
  margin: "20px auto",
  padding: 20,
  background: "#f9f9f9",
  borderRadius: 12,
  boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  fontFamily: "'Inter', sans-serif",
  color: "#333",
};

const buttonStyle = {
  backgroundColor: "#ff6600",
  color: "#fff",
  padding: "12px 20px",
  margin: "10px 5px 0 0",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "1rem",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};
