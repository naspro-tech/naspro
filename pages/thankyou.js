// /pages/thankyou.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const router = useRouter();
  const { txnRef } = router.query;

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!txnRef) return;

    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/thankyou?txnRefNo=${txnRef}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch transaction status.");
        } else {
          setTransaction(data);
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [txnRef]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Loading your payment status...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2 style={{ color: "red" }}>⚠️ {error}</h2>
        <button
          onClick={() => router.push("/")}
          style={buttonStyle}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { transactionStatus, transactionId, amount, message } = transaction;

  return (
    <div style={{
      maxWidth: 600,
      margin: "80px auto",
      padding: 30,
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "center"
    }}>
      {transactionStatus === "success" ? (
        <>
          <h1 style={{ color: "#28a745" }}>🎉 Payment Successful!</h1>
          <p style={{ fontSize: "1.2rem", marginTop: 10 }}>{message}</p>
          <p style={{ marginTop: 20 }}>
            <strong>Transaction Reference:</strong><br />
            <span style={{ fontSize: "1.1rem", color: "#555" }}>{transactionId}</span>
          </p>
          <p>
            <strong>Amount:</strong><br />
            <span style={{ fontSize: "1.1rem", color: "#555" }}>PKR {amount}</span>
          </p>
        </>
      ) : (
        <>
          <h1 style={{ color: "#dc3545" }}>❌ Payment Failed</h1>
          <p style={{ fontSize: "1.2rem", marginTop: 10 }}>{message}</p>
        </>
      )}
      <button
        onClick={() => router.push("/")}
        style={buttonStyle}
      >
        Back to Home
      </button>
    </div>
  );
}

const buttonStyle = {
  marginTop: 30,
  backgroundColor: "#ff6600",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: 8,
  fontSize: "1rem",
  cursor: "pointer"
};
        
