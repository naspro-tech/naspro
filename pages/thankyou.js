import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { service, amount, payment_method, transaction_id } = router.query;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 15, color: '#22c55e' }}>
        ✅ Payment Successful!
      </h1>
      <p>Thank you for your order. Your payment has been received successfully.</p>

      <div style={detailsBox}>
        <h3>Order Details:</h3>
        <p><strong>Service:</strong> {service}</p>
        <p><strong>Amount Paid:</strong> PKR {amount}</p>
        <p><strong>Payment Method:</strong> {payment_method || 'Bank Transfer'}</p>
        {transaction_id && <p><strong>Transaction ID:</strong> {transaction_id}</p>}
      </div>

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
