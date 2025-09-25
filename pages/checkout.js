// /pages/checkout.js
import { useState } from "react";

export default function Checkout() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    amount: "",
    billRef: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto-submit hidden form to JazzCash
      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = data.paymentUrl;

      Object.keys(data.payload).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data.payload[key];
        formEl.appendChild(input);
      });

      document.body.appendChild(formEl);
      formEl.submit();
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "80px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <label>Name*</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email*</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Phone*</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label>CNIC (last 6 digits)*</label>
        <input
          name="cnic"
          value={form.cnic}
          onChange={handleChange}
          required
        />

        <label>Amount (PKR)*</label>
        <input
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <label>Bill Reference*</label>
        <input
          name="billRef"
          value={form.billRef}
          onChange={handleChange}
          required
        />

        <label>Description (optional)</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 20,
            backgroundColor: "#ff6600",
            color: "#fff",
            padding: "12px 24px",
            border: "none",
            borderRadius: 8,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
            }
            
