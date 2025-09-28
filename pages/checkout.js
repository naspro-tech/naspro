// /pages/checkout.js
import { useState } from "react";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    amount: "",
    phone: "",
    cnic: "",
    billReference: "billRef123",
    description: "Testing",
  });
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>JazzCash Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount (in PKR): </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone: </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>CNIC: </label>
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Bill Reference: </label>
          <input
            type="text"
            name="billReference"
            value={formData.billReference}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Description: </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Checkout</button>
      </form>

      {response && (
        <pre style={{ marginTop: "20px", background: "#f4f4f4", padding: "10px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
