import { useEffect } from "react";

export default function PaymentPage({ payload, apiUrl }) {
  useEffect(() => {
    // Auto-submit the form when page loads
    if (payload && apiUrl) {
      document.getElementById("jazzcashForm").submit();
    }
  }, [payload, apiUrl]);

  if (!payload || !apiUrl) {
    return <p>Loading payment details...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "Inter,sans-serif" }}>
      <h2>Redirecting to JazzCash...</h2>
      <form id="jazzcashForm" method="POST" action={apiUrl}>
        {Object.keys(payload).map((key) => (
          <input key={key} type="hidden" name={key} value={payload[key]} />
        ))}
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            backgroundColor: "#ff6600",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            marginTop: 20,
          }}
        >
          Click here if you are not redirected
        </button>
      </form>
    </div>
  );
}

// Server-side props to generate payload
export async function getServerSideProps(context) {
  const { service, amount, name, email, phone, description } = context.query;

  // Hardcoded JazzCash credentials for sandbox
  const merchantId = "MC302132";
  const password = "53v2z2u302";
  const salt = "z60gb5u008";

  // Helper to format date YYYYMMDDHHMMSS
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
  };

  const now = new Date();
  const pp_TxnDateTime = formatDate(now);
  const pp_TxnExpiryDateTime = formatDate(new Date(now.getTime() + 1 * 60 * 60 * 1000)); // +1 hour

  const pp_TxnRefNo = "T" + pp_TxnDateTime;
  const pp_BillReference = "billRef";

  const pp_Amount = (Number(amount) * 100).toString(); // amount in paisa

  // Build payload
  const payloadData = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo,
    pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime,
    pp_BillReference,
    pp_Description: description || "",
    pp_TxnExpiryDateTime,
    pp_ReturnURL: "https://naspropvt.vercel.app/api/jazzcash_response",
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
    pp_SecureHash: "",
  };

  // Generate hash
  const crypto = require("crypto");
  const hashKeys = Object.keys(payloadData).filter((k) => k !== "pp_SecureHash").sort();
  const hashString = salt + "&" + hashKeys.map((k) => payloadData[k]).join("&");
  const secureHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex").toUpperCase();

  payloadData.pp_SecureHash = secureHash;

  return {
    props: {
      payload: payloadData,
      apiUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/Transactionmanagement/merchantform/",
    },
  };
}
