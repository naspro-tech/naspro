import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const SERVICE_PRICES = {
  webapp: 30000,
  domainhosting: 3500,
  branding: 5000,
  ecommerce: 50000,
  cloudit: 0,
  digitalmarketing: 15000,

  // ✅ Added Testing Service (for Easypaisa PKR 1 payment)
  testing: 1,
};

const SERVICE_LABELS = {
  webapp: "Web & App Development",
  domainhosting: "Domain & Hosting",
  branding: "Branding & Logo Design",
  ecommerce: "E-Commerce Solutions",
  cloudit: "Cloud & IT Infrastructure",
  digitalmarketing: "Digital Marketing",

  // ✅ Added Testing Service label
  testing: "Testing Service",
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="checkout-container">
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p className="price">Price: PKR {SERVICE_PRICES[service].toLocaleString()}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Name*:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Email*:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>
          Phone*:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="03XXXXXXXXX"
            pattern="03\\d{9}"
            maxLength={11}
          />
        </label>

        <label>
          CNIC (last 6 digits)*:
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
            maxLength={6}
            pattern="\\d{6}"
            placeholder="Enter last 6 digits of CNIC"
          />
        </label>

        <label>
          Description (optional):
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </label>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <button type="submit" className="submit-btn">Proceed to Payment</button>
      </form>

      <style jsx>{`
        .checkout-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 25px;
          background: #0f172a; /* Dark navy */
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          font-family: "Inter", sans-serif;
          color: #e2e8f0;
        }
        h1 {
          text-align: center;
          font-size: 1.6rem;
          color: #38bdf8;
          margin-bottom: 10px;
        }
        .price {
          text-align: center;
          font-size: 1.1rem;
          margin-bottom: 20px;
          color: #facc15;
        }
        form label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
          color: #cbd5e1;
        }
        input,
        textarea {
          width: 100%;
          padding: 12px;
          margin-top: 6px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #1e293b;
          color: #f1f5f9;
          font-size: 1rem;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
        }
        .error {
          color: #f87171;
          margin-bottom: 15px;
          font-weight: 500;
        }
        .submit-btn {
          background: linear-gradient(135deg, #f97316, #dc2626);
          color: #fff;
          padding: 14px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          font-size: 1rem;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .submit-btn:hover {
          background: linear-gradient(135deg, #ea580c, #b91c1c);
          transform: scale(1.03);
          box-shadow: 0 0 18px rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </div>
  );
              }
