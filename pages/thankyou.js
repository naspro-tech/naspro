// /pages/thankyou.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ThankYou() {
  const router = useRouter();
  const { txnRef } = router.query;

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!txnRef) return;

    async function fetchPaymentStatus() {
      try {
        const response = await fetch("/api/thankyou", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txnRefNo: txnRef }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setErrorMsg(result.message || "Failed to fetch payment status.");
        } else {
          setPaymentData(result);
        }
      } catch (err) {
        setErrorMsg("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentStatus();
  }, [txnRef]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Loading your payment status...</h2>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ textAlign: "center", marginTop: 80, color: "red" }}>
        <h2>❌ Payment Verification Failed</h2>
        <p>{errorMsg}</p>
        <button onClick={() => router.push("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      {paymentData.success ? (
        <>
          <h1 style={{ color: "#28a745" }}>🎉 Payment Successful!</h1>
          <p style={{ fontSize: "1.2rem", marginTop: 10 }}>
            Thank you for your payment.
          </p>
          <p style={{ marginTop: 20 }}>
            <strong>Transaction Reference:</strong>
            <br />
            <span style={{ fontSize: "1.1rem", color: "#555" }}>
              {paymentData.transactionId}
            </span>
          </p>
          <p>
            <strong>Amount:</strong> PKR {paymentData.amount}
          </p>
        </>
      ) : (
        <>
          <h1 style={{ color: "red" }}>❌ Payment Failed</h1>
          <p>{paymentData.message}</p>
        </>
      )}

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: 30,
          backgroundColor: "#ff6600",
          color: "#fff",
          padding: "12px 24px",
          border: "none",
          borderRadius: 8,
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>
    </div>
  );
      }
    
