import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const SERVICE_LABELS = {
  webapp: 'Web & App Development',
  domainhosting: 'Domain & Hosting',
  branding: 'Branding & Logo Design',
  ecommerce: 'E-Commerce Solutions',
  cloudit: 'Cloud & IT Infrastructure',
  digitalmarketing: 'Digital Marketing',
};

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
const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};
const labelStyle = { display: "block", marginBottom: 12 };
const summaryBoxStyle = {
  backgroundColor: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: 20,
  lineHeight: 1.6,
};

export default function PaymentPage() {
  const router = useRouter();
  const { service, amount, name, email, phone, description } = router.query;

  const [order, setOrder] = useState({
    service: "",
    amount: 0,
    name: "",
    email: "",
    phone: "",
    description: "",
  });
  const [orderId, setOrderId] = useState("");
  const [method, setMethod] = useState(null);
  const [bankStep, setBankStep] = useState(0);
  const [proof, setProof] = useState({
    transactionNumber: "",
    accountTitle: "",
    accountNumber: "",
    screenshot: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, description });
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);
    }
  }, [service, amount, name, email, phone, description]);

  const handleJazzCashPayment = async () => {
    if (!order.phone || order.phone.length !== 11) {
      alert("Please provide a valid phone number for JazzCash payment.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(order.amount),
          description: `Payment for ${
            SERVICE_LABELS[order.service] || order.service
          } - ${order.name}`,
          mobileNumber: order.phone,
          name: order.name,
          email: order.email,
          service: order.service,
        }),
      });
      const data = await response.json();
      if (data.success && data.payload) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action =
          "https://sandbox.jazzcash.com.pk/CustomerPortal/Transactionmanagement/merchantform/";

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
        alert("Failed to initiate JazzCash payment.");
      }
    } catch (error) {
      console.error("JazzCash Error:", error);
      alert("Error initiating JazzCash payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComingSoon = () => alert("This payment method is coming soon!");
  const handleBankStep1 = () => setBankStep(1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setProof({ ...proof, screenshot: files[0] });
    else setProof({ ...proof, [name]: value });
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    if (!proof.transactionNumber || !proof.accountTitle || !proof.accountNumber || !proof.screenshot) {
      alert("Please complete all fields before submitting.");
      return;
    }
    const orderData = {
      orderId,
      service: order.service,
      amount: order.amount,
      payment_method: "Bank Transfer",
      transaction_id: proof.transactionNumber,
      name: order.name,
      email: order.email,
      phone: order.phone,
      description: order.description,
    };
    localStorage.setItem("lastOrder", JSON.stringify(orderData));
    alert("Payment proof submitted successfully!");
    router.push("/thankyou");
  };

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: 15, textAlign: "center" }}>
        Payment
      </h2>

      <div style={summaryBoxStyle}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><b>Service:</b> {serviceLabel}</p>
        <p><b>Name:</b> {order.name}</p>
        <p><b>Email:</b> {order.email}</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>Description:</b> {order.description || "N/A"}</p>
        <p><b>Amount:</b> PKR {Number(order.amount).toLocaleString()}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleJazzCashPayment}
          disabled={loading}
          style={loading ? { ...buttonStyle, backgroundColor: "#6c757d", cursor: "not-allowed" } : buttonStyle}
        >
          {loading ? "Processing..." : "Pay with JazzCash"}
        </button>

        <button
          onClick={handleComingSoon}
          style={{ ...buttonStyle, backgroundColor: "#388e3c" }}
        >
          Pay with Easypaisa (Coming Soon)
        </button>

        <button
          onClick={() => setMethod("bank")}
          style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333", cursor: "pointer" }}
        >
          Pay via Bank Transfer
        </button>
      </div>

      {method === "bank" && bankStep === 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Bank Transfer Details</h3>
          <p>Bank Name: <b>JS Bank</b></p>
          <p>Account Title: <b>NASPRO PRIVATE LIMITED</b></p>
          <p>Account Number: <b>00028010102</b></p>
          <button onClick={handleBankStep1} style={{ ...buttonStyle, backgroundColor: "#ff6600" }}>
            I Have Completed the Payment
          </button>
        </div>
      )}

      {method === "bank" && bankStep === 1 && (
        <form style={{ marginTop: 20 }} onSubmit={handleBankSubmit}>
          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Submit Payment Proof</h3>
          <label style={labelStyle}>
            Transaction Number:
            <input type="text" name="transactionNumber" value={proof.transactionNumber} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Title:
            <input type="text" name="accountTitle" value={proof.accountTitle} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Number:
            <input type="text" name="accountNumber" value={proof.accountNumber} onChange={handleChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Screenshot:
            <input type="file" name="screenshot" accept="image/*" onChange={handleChange} style={inputStyle} />
          </label>
          <button type="submit" style={buttonStyle}>Submit Proof & Complete Payment</button>
        </form>
      )}
    </div>
  );
          }
          
