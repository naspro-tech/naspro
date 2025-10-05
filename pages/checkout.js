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
    return (
      <p style={{ padding: 20, textAlign: "center" }}>
        Loading service details...
      </p>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p className="price">
        <strong>Price:</strong> PKR {SERVICE_PRICES[service].toLocaleString()}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Name*:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email*:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
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

        <button type="submit" className="btn-checkout">
          Proceed to Payment
        </button>
      </form>

      {/* Styles */}
      <style jsx>{`
        .checkout-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 20px;
          background: linear-gradient(135deg, #111827, #1e293b);
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
          font-family: "Inter", sans-serif;
          color: #f8fafc;
        }

        h1 {
          font-size: 1.8rem;
          margin-bottom: 10px;
          color: #38bdf8;
          text-align: center;
        }

        .price {
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        form label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
        }

        input,
        textarea {
          width: 100%;
          padding: 10px;
          margin-top: 6px;
          border-radius: 8px;
          border: 1px solid #334155;
          font-size: 1rem;
          background: #0f172a;
          color: #f8fafc;
        }

        textarea {
          resize: vertical;
        }

        .error {
          color: #f87171;
          margin-bottom: 15px;
          text-align: center;
        }

        .btn-checkout {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
          color: #fff;
          border: none;
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: all 0.25s ease-in-out;
        }

        .btn-checkout:hover {
          background: linear-gradient(135deg, #ea580c, #b91c1c);
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.6);
        }
      `}</style>
    </div>
  );
              }
