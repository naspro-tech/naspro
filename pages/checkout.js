import { useState } from "react";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    amount: "3000000", // in paisa (Rs. 30,000.00)
    phone: "03123456789",
    cnic: "345678",
    billReference: "billRef123",
    description: "Testing",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>JazzCash Checkout</h1>

      <div>
        <label>Amount (in paisa): </label>
        <input
          type="text"
          name="amount"
          value={form.amount}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Phone: </label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>CNIC: </label>
        <input
          type="text"
          name="cnic"
          value={form.cnic}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Bill Reference: </label>
        <input
          type="text"
          name="billReference"
          value={form.billReference}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Description: </label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing..." : "Checkout"}
      </button>

      {response && (
        <pre style={{ marginTop: 20, background: "#eee", padding: 10 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
  }
            
