// /pages/thankyou.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const [txnData, setTxnData] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      // Get JazzCash redirect params from query string
      setTxnData(router.query);
    }
  }, [router.isReady, router.query]);

  if (!txnData) {
    return <p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>;
  }

  const { pp_ResponseCode, pp_ResponseMessage, pp_TxnRefNo, pp_Amount } = txnData;

  const isSuccess = pp_ResponseCode === "000"; // JazzCash success code

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
      <h1>{isSuccess ? "🎉 Payment Successful!" : "❌ Payment Failed"}</h1>

      <p>
        <strong>Message:</strong> {pp_ResponseMessage || "No response message"}
      </p>
      <p>
        <strong>Transaction Ref:</strong> {pp_TxnRefNo}
      </p>
      <p>
        <strong>Amount:</strong> {pp_Amount ? `${pp_Amount} PKR (paisa)` : "-"}
      </p>

      <a
        href="/"
        style={{
          marginTop: 30,
          display: "inline-block",
          backgroundColor: "#ff6600",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: "600",
          textDecoration: "none",
        }}
      >
        Back to Home
      </a>
    </div>
  );
}
