import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const containerStyle = {
  maxWidth: 600,
  margin: "30px auto",
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
  padding: "12px",
  borderRadius: 8,
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  width: "100%",
  cursor: "pointer",
  marginTop: 10,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const labelStyle = { display: "block", marginBottom: 12 };

export default function PaymentPage() {
  const [method, setMethod] = useState(null);
  const [bankStep, setBankStep] = useState(0);
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

  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, cnic, description });
    }
  }, [service, amount, name, email, phone, cnic, description]);

  const handleJazzCash = () => alert("JazzCash payment is coming soon!");
  const handleEasypaisa = () => alert("Easypaisa payment is coming soon!");
  const handleBankStep1 = () => setBankStep(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setProof({ ...proof, screenshot: files[0] });
    else setProof({ ...proof, [name]: value });
  };

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
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: 15, textAlign: "center" }}>Payment - {order.service}</h2>

      <p style={{ marginBottom: 20, textAlign: "center" }}>
        <b>Amount:</b> PKR {Number(order.amount).toLocaleString()}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={handleJazzCash} style={{ ...buttonStyle, backgroundColor: "#d32f2f" }}>
          Pay with JazzCash (Coming Soon)
        </button>
        <button onClick={handleEasypaisa} style={{ ...buttonStyle, backgroundColor: "#388e3c" }}>
          Pay with Easypaisa (Coming Soon)
        </button>
        <button onClick={() => setMethod("bank")} style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333" }}>
          Pay via Bank Transfer
        </button>
      </div>

      {/* Bank Step 1: Show details */}
      {method === "bank" && bankStep === 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Bank Transfer Details</h3>
          <p>Bank Name: <b>JS Bank</b></p>
          <p>Account Title: <b>NASPRO PRIVATE LIMITED</b></p>
          <p>Account Number: <b>00028010102</b></p>
          <button onClick={handleBankStep1} style={{ ...buttonStyle, backgroundColor: "#ff6600" }}>
            I Have Completed the Payment
          </button>
        </div>
      )}

      {/* Bank Step 2: Submit proof */}
      {method === "bank" && bankStep === 1 && (
        <form style={{ marginTop: 20 }} onSubmit={handleBankSubmit}>
          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Submit Payment Proof</h3>
          <label style={labelStyle}>
            Transaction Number:
            <input type="text" name="transactionNumber" value={proof.transactionNumber} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Title:
            <input type="text" name="accountTitle" value={proof.accountTitle} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Number:
            <input type="text" name="accountNumber" value={proof.accountNumber} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Screenshot:
            <input type="file" name="screenshot" accept="image/*" onChange={handleChange} style={inputStyle} />
          </label>
          <button type="submit" style={buttonStyle}>Submit Proof & Complete Payment</button>
        </form>
      )}
    </div>
  );
        }
        
