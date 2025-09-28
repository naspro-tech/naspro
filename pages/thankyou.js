import { useRouter } from "next/router";

export default function ThankYou() {
  const router = useRouter();
  const { service, name } = router.query;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
      <h1>🎉 Thank You, {name}!</h1>
      <p>
        Your checkout for <strong>{service}</strong> has been received.
      </p>
      <p>We’ll contact you shortly.</p>

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
