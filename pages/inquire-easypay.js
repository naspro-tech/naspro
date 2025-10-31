import { useState } from "react";

export default function InquiryPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/easypay/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ message: "Error: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    if (!result) return null;

    const status = result?.transactionStatus || result?.status || "";
    let message = "❌ Unknown status";

    if (status === "00" || status.toLowerCase() === "success") {
      message = "✅ Transaction Successful";
    } else if (status === "02" || status.toLowerCase() === "pending") {
      message = "⏳ Transaction Pending";
    } else if (status.toLowerCase().includes("fail") || status === "99") {
      message = "❌ Transaction Failed or Not Settled";
    }

    return (
      <div style={{ marginTop: 20 }}>
        <h3>{message}</h3>
        <pre
          style={{
            background: "#f8f8f8",
            padding: 10,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
        padding: "40px 15px",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "auto",
          background: "white",
          borderRadius: 12,
          padding: 25,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Easypaisa Transaction Inquiry
        </h2>

        <form onSubmit={handleInquiry}>
          <label style={{ fontWeight: "bold" }}>Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            required
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              marginTop: 6,
              marginBottom: 15,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#0c8c4a",
              color: "white",
              padding: 10,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Checking..." : "Check Transaction"}
          </button>
        </form>

        {renderStatus()}
      </div>
    </div>
  );
    }
