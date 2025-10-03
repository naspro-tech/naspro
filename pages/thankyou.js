import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  textAlign: "center",
};

const successBox = {
  background: "#d4edda",
  color: "#155724",
  padding: "15px",
  borderRadius: "8px",
  margin: "20px 0",
  textAlign: "left",
};

const errorBox = {
  background: "#f8d7da",
  color: "#721c24",
  padding: "15px",
  borderRadius: "8px",
  margin: "20px 0",
  textAlign: "left",
};

const detailsBox = {
  background: "white",
  padding: "15px",
  borderRadius: "8px",
  margin: "20px 0",
  textAlign: "left",
};

const contactBox = {
  background: "#e8f5e8",
  padding: "15px",
  borderRadius: "8px",
  margin: "20px 0",
};

const buttonStyle = {
  backgroundColor: "#ff6600",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginTop: 20,
  fontSize: "1rem",
};

export default function ThankYou() {
  const router = useRouter();
  const [order, setOrder] = useState({
    orderId: "",
    service: "",
    amount: "",
    payment_method: "",
    transaction_id: "",
    name: "",
    email: "",
    phone: "",
    cnic: "",
    description: "",
    responseCode: "",
    responseMessage: "",
    success: true
  });

  useEffect(() => {
    const {
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      transactionId,
      name,
      email,
      phone,
      cnic,
      description,
      responseCode,
      responseMessage,
      success,
      error
    } = router.query;

    // Failed payment
    if (success === 'false' || error) {
      setOrder(prev => ({
        ...prev,
        success: false,
        responseMessage: error || 'Payment failed'
      }));
      return;
    }

    if (service && amount) {
      setOrder({
        orderId: orderId || transactionId,
        service,
        amount,
        payment_method: payment_method || "JazzCash",
        transaction_id: transaction_id || transactionId,
        name,
        email,
        phone,
        cnic,
        description,
        responseCode,
        responseMessage,
        success: responseCode === '000' // ✅ fixed
      });
    } else {
      // Fallback to localStorage
      const storedOrder = localStorage.getItem("lastOrder");
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        setOrder(prev => ({
          ...prev,
          ...parsedOrder,
          success: parsedOrder.responseCode === '000' // ✅ fixed
        }));
      }
    }
  }, [router.query]);

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  const getResponseMessage = (code) => {
    const messages = {
      '000': 'Transaction Successful',
      '001': 'Transaction Failed',
      '002': 'Transaction Cancelled',
      '003': 'Invalid Merchant ID',
      '004': 'Invalid Password',
      '005': 'Invalid OTP',
      '006': 'Transaction Timeout',
      '007': 'Invalid Transaction Amount',
      '008': 'Insufficient Balance',
      '009': 'Transaction Not Permitted',
      '010': 'Invalid Currency',
      '011': 'Invalid TxnRefNo',
      '012': 'Duplicate TxnRefNo'
    };
    return messages[code] || order.responseMessage || 'Thank you for your payment!';
  };

  return (
    <div style={containerStyle}>
      {order.success ? (
        <>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 15, color: '#22c55e' }}>
            ✅ Payment Successful!
          </h1>
          <p>Thank you for your order. Our team will confirm your payment and get back to you shortly.</p>

          <div style={successBox}>
            <h3>Payment Confirmed</h3>
            <p>{getResponseMessage(order.responseCode)}</p>
            {order.responseCode && (
              <p><strong>Response Code:</strong> {order.responseCode}</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: "1.5rem", marginBottom: 15, color: '#dc2626' }}>
            ❌ Payment Failed
          </h1>
          <div style={errorBox}>
            <h3>Payment Not Completed</h3>
            <p>{order.responseMessage || 'There was an issue processing your payment.'}</p>
            <p>Please try again or contact support if the problem persists.</p>
          </div>
        </>
      )}

      <div style={detailsBox}>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Service:</strong> {serviceLabel}</p>
        <p><strong>Amount:</strong> PKR {order.amount}</p>
        <p><strong>Payment Method:</strong> {order.payment_method || 'JazzCash'}</p>
        {order.transaction_id && <p><strong>Transaction ID:</strong> {order.transaction_id}</p>}
        <hr style={{ margin: "10px 0" }} />
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        {order.cnic && <p><strong>CNIC (last 6 digits):</strong> {order.cnic}</p>}
        <p><strong>Description:</strong> {order.description || 'N/A'}</p>
      </div>

      <div style={contactBox}>
        <h3>Contact Us:</h3>
        <p>📧 Email: naspropvt@gmail.com</p>
        <p>📞 Phone: +92 303 3792494</p>
        <p>⏰ Response Time: Within 24 hours</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button style={buttonStyle} onClick={() => router.push("/")}>
          Back to Home
        </button>
        {!order.success && (
          <button
            style={{ ...buttonStyle, backgroundColor: '#dc2626' }}
            onClick={() => router.push("/payment")}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
