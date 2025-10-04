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
    if (!order.phone || order.phone.length !== 11) {
      alert("Please provide valid phone number for JazzCash payment.");
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

      <div className="summary-box">
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Service:</strong> {serviceLabel}</p>
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Description:</strong> {order.description || "N/A"}</p>
        <p><strong>Amount:</strong> PKR {Number(order.amount).toLocaleString()}</p>
      </div>

      <div className="button-group">
        <button onClick={handleJazzCashPayment} disabled={loading}>
          {loading ? "Processing..." : "Pay with JazzCash"}
        </button>

        <button onClick={handleComingSoon} className="secondary">
          Pay with Easypaisa (Coming Soon)
        </button>

        <button onClick={() => setMethod("bank")} className="tertiary">
          Pay via Bank Transfer
        </button>
      </div>

      {method === "bank" && bankStep === 0 && (
        <div className="bank-step">
          <h3>Bank Transfer Details</h3>
          <p>Bank Name: <b>JS Bank</b></p>
          <p>Account Title: <b>NASPRO PRIVATE LIMITED</b></p>
          <p>Account Number: <b>00028010102</b></p>
          <button onClick={handleBankStep1}>I Have Completed the Payment</button>
        </div>
      )}

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
          <button type="submit">Submit Proof & Complete Payment</button>
        </form>
      )}

      <style jsx>{`
        .payment-container {
          max-width: 100%;
          padding: 20px;
          margin: 10px auto;
          font-family: 'Inter', sans-serif;
        }
        h2 {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: 15px;
        }
        .summary-box {
          background: #fff;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .button-group button {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .button-group .secondary {
          background: #388e3c;
          color: #fff;
        }
        .button-group .tertiary {
          background: #ccc;
          color: #333;
        }
        .bank-step, .bank-step-form {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
        }
        label {
          display: block;
          margin-bottom: 12px;
        }
        input[type="text"], input[type="file"] {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          margin-top: 6px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
                    }
          
