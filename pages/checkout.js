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

  useEffect(() => {
    if (!service) return;
    if (!SERVICE_PRICES.hasOwnProperty(service)) {
      setErrorMsg("Invalid service selected.");
    } else {
      setErrorMsg("");
    }
  }, [service]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg("CNIC must be exactly 6 digits (last 6 digits).");
      return;
    }
    if (SERVICE_PRICES[service] === 0) {
      setErrorMsg("Please contact us for custom pricing on this service.");
      return;
    }

    // Redirect to Payment page with query params
    const query = {
      service,
      amount: SERVICE_PRICES[service],
      ...formData,
    };

    router.push({
      pathname: "/payment",
      query,
    });
  };

  if (!service) {
    return <p style={{ padding: 20, textAlign: "center" }}>Loading service details...</p>;
  }

  return (
    <div style={containerStyle}>
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p><strong>Price:</strong> PKR {SERVICE_PRICES[service].toLocaleString()}</p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          Name*:
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
        </label>

        <label style={labelStyle}>
          Email*:
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
        </label>

        <label style={labelStyle}>
          Phone*:
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} required placeholder="03XXXXXXXXX" pattern="03\d{9}" maxLength={11} />
        </label>

        <label style={labelStyle}>
          CNIC (last 6 digits)*:
          <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} style={inputStyle} required maxLength={6} pattern="\d{6}" placeholder="Enter last 6 digits of CNIC" />
        </label>

        <label style={labelStyle}>
          Description (optional):
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </label>

        {errorMsg && <p style={{ color: "red", marginBottom: 15 }}>{errorMsg}</p>}

        <button type="submit" style={buttonStyle}>Proceed to Payment</button>
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
    
