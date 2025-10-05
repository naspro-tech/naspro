import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const SERVICE_LABELS = {
  webapp: "Web & App Development",
  domainhosting: "Domain & Hosting",
  branding: "Branding & Logo Design",
  ecommerce: "E-Commerce Solutions",
  cloudit: "Cloud & IT Infrastructure",
  digitalmarketing: "Digital Marketing",
};

export default function PaymentPage() {
  const router = useRouter();
  const { service, amount, name, email, phone, cnic, description } = router.query;

  const [order, setOrder] = useState({
    service: "",
    amount: 0,
    name: "",
    email: "",
    phone: "",
    cnic: "",
    description: "",
  });
  const [orderId, setOrderId] = useState("");
  const [method, setMethod] = useState(null);
  const [bankStep, setBankStep] = useState(0);
  const [proof, setProof] = useState({ transactionNumber: "", accountTitle: "", accountNumber: "", screenshot: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, cnic, description });
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);
    }
  }, [service, amount, name, email, phone, cnic, description]);

  const handleJazzCashPayment = async () => {
    if (!/^03\d{9}$/.test(order.phone)) {
      alert("Please provide a valid Pakistani phone number for JazzCash payment.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(order.amount),
          description: order.description || "Payment",
          orderId,
          mobileNumber: order.phone,
          name: order.name,
          email: order.email,
          cnic: order.cnic, // ✅ Added CNIC
          service: order.service,
        }),
      });

      const data = await response.json();

      if (data.success && data.apiUrl && data.payload) {
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
        alert("Failed to initiate JazzCash payment: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("JazzCash Error:", error);
      alert("Error initiating JazzCash payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBankStep1 = () => setBankStep(1);
  const handleComingSoon = () => alert("This payment method is coming soon!");

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
      cnic: order.cnic,
      description: order.description,
    };
    localStorage.setItem("lastOrder", JSON.stringify(orderData));
    alert("Payment proof submitted successfully!");
    router.push("/thankyou");
  };

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  return (
    <div className="payment-container">
      <h2>Payment</h2>

      {/* Summary Section */}
      <div className="summary-box">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Service:</strong> {serviceLabel}</p>
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>CNIC:</strong> {order.cnic}</p> {/* ✅ Added CNIC */}
        <p><strong>Description:</strong> {order.description || "N/A"}</p>
        <p><strong>Amount:</strong> PKR {Number(order.amount).toLocaleString()}</p>
      </div>

      {/* Buttons */}
      <div className="button-group">
        <button onClick={handleJazzCashPayment} disabled={loading} className="btn jazzcash">
          {loading ? "Processing..." : "Pay with JazzCash"}
        </button>

        <button onClick={handleComingSoon} className="btn easypaisa">
          Pay with Easypaisa (Coming Soon)
        </button>

        <button onClick={() => setMethod("bank")} className="btn bank">
          Pay via Bank Transfer
        </button>
      </div>

      {/* Bank Transfer - Step 0 */}
      {method === "bank" && bankStep === 0 && (
        <div className="bank-step">
          <h3>Bank Transfer Details</h3>
          <div className="bank-card">
            <p><b>Bank Name:</b> JS Bank</p>
            <p><b>Account Title:</b> NASPRO PRIVATE LIMITED</p>
            <p><b>Account Number:</b> 00028010102</p>
          </div>
          <button className="btn bank" onClick={handleBankStep1}>
            I Have Completed the Payment
          </button>
        </div>
      )}

      {/* Bank Transfer - Step 1 */}
      {method === "bank" && bankStep === 1 && (
        <form className="bank-step-form" onSubmit={handleBankSubmit}>
          <h3>Submit Payment Proof</h3>
          <label>
            Transaction Number:
            <input type="text" name="transactionNumber" value={proof.transactionNumber} onChange={handleChange} />
          </label>
          <label>
            Account Title:
            <input type="text" name="accountTitle" value={proof.accountTitle} onChange={handleChange} />
          </label>
          <label>
            Account Number:
            <input type="text" name="accountNumber" value={proof.accountNumber} onChange={handleChange} />
          </label>
          <label>
            Screenshot:
            <input type="file" name="screenshot" accept="image/*" onChange={handleChange} />
          </label>
          <button type="submit" className="btn bank">Submit Proof & Complete Payment</button>
        </form>
      )}

      {/* Styles */}
      <style jsx>{`
        .payment-container {
          max-width: 600px;
          padding: 20px;
          margin: 10px auto;
          font-family: 'Inter', sans-serif;
          color: #fff;
        }
        h2 {
          text-align: center;
          font-size: 1.8rem;
          margin-bottom: 20px;
        }
        .summary-box {
          background: linear-gradient(135deg, #111827, #1e293b);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          line-height: 1.6;
          color: #f8fafc;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        .summary-box strong {
          color: #38bdf8;
        }
        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 12px;
          color: #fff;
          border: none;
          transition: all 0.25s ease-in-out;
        }
        .btn.jazzcash {
          background: linear-gradient(135deg, #f97316, #dc2626);
        }
        .btn.jazzcash:hover {
          background: linear-gradient(135deg, #ea580c, #b91c1c);
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(249,115,22,0.6);
        }
        .btn.easypaisa {
          background: linear-gradient(135deg, #22c55e, #15803d);
        }
        .btn.easypaisa:hover {
          background: linear-gradient(135deg, #16a34a, #166534);
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(34,197,94,0.6);
        }
        .btn.bank {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
        }
        .btn.bank:hover {
          background: linear-gradient(135deg, #2563eb, #1e3a8a);
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(59,130,246,0.6);
        }
        .bank-step, .bank-step-form {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .bank-step h3, .bank-step-form h3 {
          font-size: 1.2rem;
          margin-bottom: 15px;
          text-align: center;
        }
        .bank-card {
          background: rgba(255,255,255,0.08);
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }
        input[type="text"], input[type="file"] {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: none;
          margin-top: 6px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
        }
  
