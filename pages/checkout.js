// /pages/checkout.js
import { useState } from "react";
import { createHmac } from "crypto";

// 🔥 Hardcoded JazzCash credentials (sandbox for testing)
const MERCHANT_ID = "MC339532";
const PASSWORD = "2282sxh9z8";
const INTEGRITY_SALT = "1g90sz31w2"; // replace with your salt
const JAZZCASH_URL =
  "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

// Function to create SecureHash
function createJazzCashHash(params) {
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k.startsWith("pp_") &&
        k !== "pp_SecureHash" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ""
    )
    .sort();

  const valuesString = keys.map((k) => params[k]).join("&");
  const hashString = `${INTEGRITY_SALT}&${valuesString}`;

  const hmac = createHmac("sha256", INTEGRITY_SALT);
  hmac.update(hashString, "utf8");
  return hmac.digest("hex").toUpperCase();
}

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnic: "",
    description: "Testing",
    amount: "3000000", // PKR 30,000.00
  });

  const [response, setResponse] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transaction date & expiry
    const now = new Date();
    const txnDateTime = now
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const expiryDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    // Build payload
    const payload = {
      pp_Language: "EN",
      pp_MerchantID: MERCHANT_ID,
      pp_Password: PASSWORD,
      pp_TxnRefNo: `T${Date.now()}`,
      pp_Amount: form.amount,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: "billRef123",
      pp_Description: form.description,
      pp_MobileNumber: form.phone,
      pp_CNIC: form.cnic,
      ppmpf_1: "",
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
      DiscountProfileId: "",
    };

    payload.pp_SecureHash = createJazzCashHash(payload);

    try {
      const res = await fetch(JAZZCASH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Checkout - JazzCash</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          name="cnic"
          placeholder="CNIC (last 6 digits)"
          value={form.cnic}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">Pay Now</button>
      </form>

      {response && (
        <pre style={{ marginTop: "1rem" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
            }
            
