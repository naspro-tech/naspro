// /pages/checkout.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const SERVICE_PRICES = {
  webapp: 30000,
  domainhosting: 3500,
  branding: 5000,
  ecommerce: 50000,
  cloudit: 0,
  digitalmarketing: 15000,
};

const SERVICE_LABELS = {
  webapp: "Web & App Development",
  domainhosting: "Domain & Hosting",
  branding: "Branding & Logo Design",
  ecommerce: "E-Commerce Solutions",
  cloudit: "Cloud & IT Infrastructure",
  digitalmarketing: "Digital Marketing",
};

export default function Checkout() {
  const router = useRouter();
  const { service } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    description: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const price =
    service && SERVICE_PRICES.hasOwnProperty(service)
      ? SERVICE_PRICES[service] === 0
        ? "Custom Pricing - Please contact us"
        : `PKR ${SERVICE_PRICES[service].toLocaleString()}`
      : "";

  useEffect(() => {
    if (!service) return;
    if (!SERVICE_PRICES.hasOwnProperty(service)) {
      setErrorMsg("Invalid service selected.");
    } else {
      setErrorMsg("");
    }
  }, [service]);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg("CNIC must be exactly 6 digits (last 6 digits).");
      return;
    }
    if (service === "cloudit") {
      setErrorMsg("Please contact us for custom pricing on Cloud & IT Infrastructure.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_key: service, ...formData }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || "Payment initiation failed.");
        setLoading(false);
        return;
      }

      // JazzCash success navigation
      if (result.jazzCashResponse && result.jazzCashResponse.pp_ResponseCode === "000") {
        router.push(`/thankyou?txnRef=${result.jazzCashResponse.pp_TxnRefNo}`);
      } else if (result.jazzCashResponse) {
        setErrorMsg(`JazzCash Error: ${result.jazzCashResponse.pp_ResponseMessage}`);
        setLoading(false);
      } else {
        setErrorMsg("Unexpected response from payment gateway.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!service) {
    return <p style={{ padding: 20, textAlign: "center" }}>Loading service details...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: 10 }}>Checkout - {SERVICE_LABELS[service]}</h1>
      <p style={{ marginBottom: 20 }}><strong>Price:</strong> {price}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Name*:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          Email*:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          Phone*:
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="03\d{9}" placeholder="03XXXXXXXXX" style={inputStyle} />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          CNIC (last 6 digits)*:
          <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} required maxLength={6} pattern="\d{6}" placeholder="Enter last 6 digits of CNIC" style={inputStyle} />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          Description (optional):
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </label>

        {errorMsg && <p style={{ color: "red", marginBottom: 15 }}>{errorMsg}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const buttonStyle = {
  backgroundColor: "#ff6600",
  color: "#fff",
  padding: "12px",
  fontSize: "1rem",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
};
            
