import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const SERVICE_PRICES = {
  webapp: 30000,
  domainhosting: 3500,
  branding: 5000,
  ecommerce: 50000,
  cloudit: 0,
  digitalmarketing: 15000,
};

const SERVICE_LABELS = {
  webapp: 'Web & App Development',
  domainhosting: 'Domain & Hosting',
  branding: 'Branding & Logo Design',
  ecommerce: 'E-Commerce Solutions',
  cloudit: 'Cloud & IT Infrastructure',
  digitalmarketing: 'Digital Marketing',
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

  useEffect(() => {
    if (!service) return;
    if (!SERVICE_PRICES.hasOwnProperty(service)) {
      setErrorMsg("Invalid service selected.");
    } else {
      setErrorMsg("");
    }
  }, [service]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJazzCashPayment = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg("CNIC must be exactly 6 digits (last 6 digits).");
      setLoading(false);
      return;
    }
    if (SERVICE_PRICES[service] === 0) {
      setErrorMsg("Please contact us for custom pricing on this service.");
      setLoading(false);
      return;
    }

    try {
      const serviceLabel = SERVICE_LABELS[service] || service;

      console.log("🟡 Sending checkout data to backend...");

      // Step 1: Get JazzCash payload from backend
      const response = await fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(SERVICE_PRICES[service]),
          description: `Payment for ${serviceLabel} - ${formData.name}`,
          mobileNumber: formData.phone,
          cnic: formData.cnic,
          name: formData.name,
          email: formData.email,
          service,
        }),
      });

      const data = await response.json();
      console.log("🟡 Backend Response:", data);

      if (data.success && data.apiUrl && data.payload) {
        console.log("🟡 Calling JazzCash REST API...");
        
        // Step 2: Call JazzCash REST API directly
        const jazzcashResponse = await fetch(data.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.payload),
        });

        const result = await jazzcashResponse.json();
        console.log("🟡 JazzCash API Result:", result);

        // Step 3: Handle JazzCash response
        if (result.pp_ResponseCode === '000') {
          // Payment successful
          const orderData = {
            orderId: data.payload.pp_TxnRefNo,
            service: service,
            amount: SERVICE_PRICES[service],
            payment_method: "JazzCash",
            transaction_id: result.pp_RetreivalReferenceNo || result.pp_TxnRefNo,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cnic: formData.cnic,
            description: formData.description,
            responseCode: result.pp_ResponseCode,
            responseMessage: result.pp_ResponseMessage
          };
          localStorage.setItem("lastOrder", JSON.stringify(orderData));
          
          console.log('🟢 Payment successful, redirecting to thank you page...');
          router.push("/thankyou");
        } else {
          // Payment failed
          console.error('🔴 Payment failed:', result.pp_ResponseMessage);
          alert(`Payment failed: ${result.pp_ResponseMessage} (Code: ${result.pp_ResponseCode})`);
        }
      } else {
        alert("Failed to initiate payment: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("🔴 JazzCash Error:", error);
      alert("Error initiating JazzCash payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <p style={{ padding: 20, textAlign: "center" }}>
        Loading service details...
      </p>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 10 }}>
        Checkout - {SERVICE_LABELS[service]}
      </h1>
      <p style={{ marginBottom: 20 }}>
        <strong>Price:</strong> PKR {SERVICE_PRICES[service].toLocaleString()}
      </p>

      <form onSubmit={handleJazzCashPayment}>
        <label style={labelStyle}>
          Name*:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Email*:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Phone*:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="03\d{9}"
            placeholder="03XXXXXXXXX"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          CNIC (last 6 digits)*:
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
            maxLength={6}
            pattern="\d{6}"
            placeholder="Enter last 6 digits of CNIC"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Description (optional):
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        {errorMsg && (
          <p style={{ color: "red", marginBottom: 15 }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={loading ? loadingButtonStyle : buttonStyle}
        >
          {loading ? "Processing Payment..." : "Pay with JazzCash"}
        </button>
      </form>
    </div>
  );
}

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

const labelStyle = { display: "block", marginBottom: 12 };

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const buttonStyle = {
  backgroundColor: "#d32f2f",
  color: "#fff",
  padding: "12px",
  borderRadius: 8,
  border: "none",
  fontWeight: 600,
  fontSize: "1rem",
  width: "100%",
  cursor: "pointer",
};

const loadingButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  cursor: "not-allowed",
};
