import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SERVICE_LABELS = {
  webapp: 'Web & App Development',
  domainhosting: 'Domain & Hosting',
  branding: 'Branding & Logo Design',
  ecommerce: 'E-Commerce Solutions',
  cloudit: 'Cloud & IT Infrastructure',
  digitalmarketing: 'Digital Marketing',
  testing: 'Testing Service', // ✅ added for Easypaisa Rs.1 test
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
    success: true,
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
      success,
      error,
    } = router.query;

    if (success === "false" || error) {
      setOrder((prev) => ({
        ...prev,
        success: false,
        transaction_id: transaction_id || "",
      }));
      return;
    }

    if (service && amount) {
      setOrder({
        orderId,
        service,
        amount,
        payment_method:
          payment_method ||
          (transaction_id ? "Easypaisa" : "Bank Transfer"), // ✅ display Easypaisa if txn ID exists
        transaction_id,
        name,
        email,
        phone,
        cnic,
        description,
        success: true,
      });
    } else {
      const storedOrder = localStorage.getItem("lastOrder");
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        setOrder((prev) => ({
          ...prev,
          ...parsedOrder,
          success: true,
        }));
      }
    }
  }, [router.query]);

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  return (
    <div style={containerStyle}>
      {order.success ? (
        <>
          <h1
            style={{
              fontSize: "1.5rem",
              marginBottom: 15,
              color: "#22c55e",
            }}
          >
            ✅ Payment Successful!
          </h1>
          <p>
            Thank you for your order. Our team will confirm your payment and get
            back to you shortly.
          </p>
        </>
      ) : (
        <>
          <h1
            style={{
              fontSize: "1.5rem",
              marginBottom: 15,
              color: "#dc2626",
            }}
          >
            ❌ Payment Failed
          </h1>
          <div style={errorBox}>
            <h3>Payment Not Completed</h3>
            <p>
              There was an issue processing your payment. Please try again or
              contact support.
            </p>
          </div>
        </>
      )}

      <div style={detailsBox}>
        <h3>Order Details:</h3>
        <p>
          <strong>Order ID:</strong> {order.orderId}
        </p>
        <p>
          <strong>Service:</strong> {serviceLabel}
        </p>
        <p>
          <strong>Amount:</strong> PKR {order.amount}
        </p>
        <p>
          <strong>Payment Method:</strong>{" "}
          {order.payment_method || "Bank Transfer"}
        </p>
        {order.transaction_id && (
          <p>
            <strong>Transaction ID:</strong> {order.transaction_id}
          </p>
        )}
        <hr style={{ margin: "10px 0" }} />
        <p>
          <strong>Name:</strong> {order.name}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.phone}
        </p>
        {order.cnic && (
          <p>
            <strong>CNIC (last 6 digits):</strong> {order.cnic}
          </p>
        )}
        <p>
          <strong>Description:</strong> {order.description || "N/A"}
        </p>
      </div>

      <div style={contactBox}>
        <h3>Contact Us:</h3>
        <p>📧 Email: naspropvt@gmail.com</p>
        <p>📞 Phone: +92 303 3792494</p>
        <p>⏰ Response Time: Within 24 hours</p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        <button style={buttonStyle} onClick={() => router.push("/")}>
          Back to Home
        </button>
        {!order.success && (
          <button
            style={{ ...buttonStyle, backgroundColor: "#dc2626" }}
            onClick={() => router.push("/checkout")}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
        }
