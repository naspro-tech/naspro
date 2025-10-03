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
      // Generate unique Order ID
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      const orderId = `NASPRO-${timestamp}-${randomNum}`;

      const serviceLabel = SERVICE_LABELS[service] || service;

      console.log("🟡 Sending checkout data to backend...");

      // Step 1: Send to backend to get JazzCash payload
      const response = await fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(SERVICE_PRICES[service]),
          description: `Payment for ${serviceLabel} - ${formData.name}`,
          orderId,
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
        // Step 2: Auto-submit hidden form to JazzCash
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.apiUrl;

        Object.keys(data.payload).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.payload[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
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
              
