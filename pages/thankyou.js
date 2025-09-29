import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { service, amount, txnRef } = router.query;

  return (
    <div style={container}>
      <h1 style={heading}>Thank You!</h1>
      <p>Your order has been received successfully.</p>
      {txnRef && <p><strong>Order/Transaction Ref:</strong> {txnRef}</p>}
      {service && <p><strong>Service:</strong> {service}</p>}
      {amount && <p><strong>Amount:</strong> PKR {amount}</p>}

      <h2 style={{ marginTop: 20 }}>Contact Us</h2>
      <p>Email: naspropvt@gmail.com</p>
      <p>Phone: +92 303 3792494</p>
    </div>
  );
}

const container = { maxWidth: 600, margin: "30px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", fontFamily: "sans-serif" };
const heading = { fontSize: "1.5rem", marginBottom: 10 };
