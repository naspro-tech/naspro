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
  });

  useEffect(() => {
    const {
      orderId,
      service,
      amount,
      payment_method,
      transaction_id,
      name,
      email,
      phone,
      cnic,
      description,
    } = router.query;

    if (service && amount) {
      setOrder({
        orderId,
        service,
        amount,
        payment_method: payment_method || "Bank Transfer",
        transaction_id,
        name,
        email,
        phone,
        cnic,
        description,
      });
    } else {
      // Fallback to localStorage
      const storedOrder = localStorage.getItem("lastOrder");
      if (storedOrder) setOrder(JSON.parse(storedOrder));
    }
  }, [router.query]);

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 15, color: '#22c55e' }}>
        ✅ Payment Successful!
      </h1>
      <p>Thank you for your order. Our team will confirm your payment and get back to you shortly.</p>

      {/* Order Summary */}
      <div style={detailsBox}>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Service:</strong> {serviceLabel}</p>
        <p><strong>Amount Paid:</strong> PKR {order.amount}</p>
        <p><strong>Payment Method:</strong> {order.payment_method || 'Bank Transfer'}</p>
        {order.transaction_id && <p><strong>Transaction ID:</strong> {order.transaction_id}</p>}
        <hr style={{ margin: "10px 0" }} />
        <p><strong>Name:</strong> {order.name}</p>
        <p><strong>Email:</strong> {order.email}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>CNIC (last 6 digits):</strong> {order.cnic}</p>
        <p><strong>Description:</strong> {order.description || 'N/A'}</p>
      </div>

      {/* Contact Information */}
      <div style={contactBox}>
        <h3>Contact Us:</h3>
        <p>📧 Email: naspropvt@gmail.com</p>
        <p>📞 Phone: +92 303 3792494</p>
      </div>

      <button style={buttonStyle} onClick={() => router.push("/")}>
        Back to Home
      </button>
    </div>
  );
        }
        
