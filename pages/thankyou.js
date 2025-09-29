import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { service, amount } = router.query;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 15 }}>Thank You!</h1>
      <p>Your order has been received.</p>

      <h3>Order Details:</h3>
      <p><strong>Service:</strong> {service}</p>
      <p><strong>Amount Paid:</strong> PKR {amount}</p>

      <h3>Contact Us:</h3>
      <p>Email: naspropvt@gmail.com</p>
      <p>Phone: +92 303 3792494</p>

      <button style={buttonStyle} onClick={() => router.push("/")}>Back to Home</button>
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
