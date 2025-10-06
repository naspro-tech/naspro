// /pages/inquiry-test.js
import { useState } from "react";

export default function InquiryTest() {
  const [txnRefNo, setTxnRefNo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleInquiry = async () => {
    if (!txnRefNo) return alert("Please enter a TxnRefNo first.");
    setLoading(true);
    setResult(null);
    setStatusText("");

    try {
      const res = await fetch("/api/jazzcash_inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txnRefNo }),
      });
      const data = await res.json();
      setResult(data);

      // interpret payment response
      const code = data?.response?.pp_PaymentResponseCode;
      if (code === "121") setStatusText("✅ Transaction Completed Successfully");
      else if (code === "000") setStatusText("🕓 Transaction Pending or Processing");
      else if (code === "124") setStatusText("❌ Transaction Failed or Reversed");
      else setStatusText("ℹ️ Unable to determine status, please verify manually.");
    } catch (err) {
      setResult({ error: "Failed to fetch inquiry result." });
      setStatusText("⚠️ API request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "80px auto", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center", color: "#006666" }}>JazzCash Status Inquiry Test</h1>

      <div style={{ marginTop: 30 }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
          Transaction Reference Number (TxnRefNo)
        </label>
        <input
          type="text"
          value={txnRefNo}
          onChange={(e) => setTxnRefNo(e.target.value)}
          placeholder="e.g. T59756197419"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      <button
        onClick={handleInquiry}
        disabled={loading}
        style={{
          backgroundColor: "#009977",
          color: "#fff",
          border: "none",
          padding: "10px 24px",
          borderRadius: "6px",
          marginTop: "15px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Checking..." : "Check Status"}
      </button>

      {statusText && (
        <div
          style={{
            marginTop: "30px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor:
              statusText.includes("✅")
                ? "#E7F8EE"
                : statusText.includes("❌")
                ? "#FDE8E8"
                : statusText.includes("🕓")
                ? "#FFF7E6"
                : "#F4F4F4",
            color:
              statusText.includes("✅")
                ? "#057A55"
                : statusText.includes("❌")
                ? "#B91C1C"
                : statusText.includes("🕓")
                ? "#B45309"
                : "#333",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          {statusText}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "25px" }}>
          <h3 style={{ color: "#006666" }}>Raw API Response</h3>
          <pre
            style={{
              background: "#F7F7F7",
              padding: "12px",
              borderRadius: "6px",
              overflowX: "auto",
              fontSize: "14px",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
  
