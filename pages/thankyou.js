import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { service, name, order } = router.query;

  const CONTACT = {
    phone: "+92 303 3792494",
    email: "naspropvt@gmail.com",
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <h1>🎉 Thank You, {name}!</h1>
      <p>Your order for <strong>{service}</strong> has been received.</p>

      {order && (
        <p>
          <strong>Order Number:</strong> {order}
        </p>
      )}

      <p>We’ll contact you shortly. For any inquiries, you can reach us at:</p>
      <p>
        <strong>Phone:</strong> {CONTACT.phone} <br />
        <strong>Email:</strong> {CONTACT.email}
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#ff6600",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>
    </div>
  );
          }
