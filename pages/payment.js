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

const loadingStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  cursor: "not-allowed"
};

export default function PaymentPage() {
  const [method, setMethod] = useState(null);
  const [bankStep, setBankStep] = useState(0);
  const [proof, setProof] = useState({ transactionNumber: "", accountTitle: "", accountNumber: "", screenshot: null });
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
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { service, amount, name, email, phone, cnic, description } = router.query;

  // Set order from query params
  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, cnic, description });
    }
  }, [service, amount, name, email, phone, cnic, description]);

  // Generate unique Order ID
  useEffect(() => {
    if (!orderId && order.service) {
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);
    }
  }, [order.service]);

  const handleJazzCash = async () => {
    const serviceLabel = SERVICE_LABELS[order.service] || order.service;
    
    // Validate required fields for JazzCash
    if (!order.cnic || order.cnic.length !== 6) {
      alert("Please provide valid CNIC (last 6 digits) for JazzCash payment.");
      return;
    }

    if (!order.phone || order.phone.length !== 11) {
      alert("Please provide valid phone number for JazzCash payment.");
      return;
    }

    setLoading(true);
    
    try {
      console.log('🟡 Initiating JazzCash payment...');
      
      const response = await fetch('/api/jazzcash_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(order.amount),
          description: `Payment for ${serviceLabel} - ${order.name}`,
          orderId: orderId,
          mobileNumber: order.phone,
          cnic: order.cnic
        }),
      });

      const data = await response.json();
      console.log('🟡 JazzCash API Response:', data);

      if (data.success) {
        console.log('🟡 Calling JazzCash REST API...');
        
        // Call JazzCash REST API directly
        const jazzcashResponse = await fetch(data.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.payload),
        });

        const result = await jazzcashResponse.json();
        console.log('🟡 JazzCash Payment Result:', result);

        if (result.pp_ResponseCode === '000') {
          // Payment successful
          const orderData = {
            orderId: orderId,
            service: order.service,
            amount: order.amount,
            payment_method: "JazzCash",
            transaction_id: result.pp_RetreivBufferenceNo || result.pp_TxnRefNo,
            name: order.name,
            email: order.email,
            phone: order.phone,
            cnic: order.cnic,
            description: order.description,
            responseCode: result.pp_ResponseCode,
            responseMessage: result.pp_ResponseMessage
          };
          localStorage.setItem("lastOrder", JSON.stringify(orderData));
          
          console.log('🟢 Payment successful, redirecting to thank you page...');
          router.push("/thankyou");
        } else {
          // Payment failed
          console.error('🔴 Payment failed:', result.pp_ResponseMessage);
          alert(`Payment failed: ${result.pp_ResponseMessage} (Code: ${result.pp_ResponseCode})`);
        }
      } else {
        console.error('🔴 API Error:', data.error);
        alert('Failed to initiate JazzCash payment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('🔴 JazzCash Error:', error);
      alert('Error initiating JazzCash payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEasypaisa = () => alert("Easypaisa payment is coming soon!");
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

    // Save order info in localStorage
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
    <div style={containerStyle}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: 15, textAlign: "center" }}>Payment</h2>

      {/* Customer Summary Box */}
      <div style={summaryBoxStyle}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><b>Service:</b> {serviceLabel}</p>
        <p><b>Name:</b> {order.name}</p>
        <p><b>Email:</b> {order.email}</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>CNIC (last 6 digits):</b> {order.cnic}</p>
        <p><b>Description:</b> {order.description || "N/A"}</p>
        <p><b>Amount:</b> PKR {Number(order.amount).toLocaleString()}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button 
          onClick={handleJazzCash} 
          disabled={loading}
          style={loading ? loadingStyle : { ...buttonStyle, backgroundColor: "#d32f2f" }}
        >
          {loading ? "Processing..." : "Pay with JazzCash"}
        </button>
        <button onClick={handleEasypaisa} style={{ ...buttonStyle, backgroundColor: "#388e3c" }}>
          Pay with Easypaisa (Coming Soon)
        </button>
        <button onClick={() => setMethod("bank")} style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#333" }}>
          Pay via Bank Transfer
        </button>
      </div>

      {/* Bank Step 1 */}
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

      {/* Bank Step 2 */}
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
