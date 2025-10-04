import { useEffect, useState } from "react";
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
  const { service, amount, name, email, phone, description } = router.query;

  const [orderId, setOrderId] = useState("");
  const [payload, setPayload] = useState(null);
  const [apiUrl, setApiUrl] = useState("");

  // Generate orderId once
  useEffect(() => {
    if (service && amount) {
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);
    }
  }, [service, amount]);

  // Fetch JazzCash payload from backend
  useEffect(() => {
    if (amount && orderId) {
      fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          description: description || "",
          orderId,
          mobileNumber: phone,
          name,
          email,
          service,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPayload(data.payload);
            setApiUrl(data.apiUrl);
          } else {
            alert("Failed to initiate JazzCash payment: " + (data.error || ""));
          }
        })
        .catch((err) => alert("Error initiating JazzCash payment"));
    }
  }, [amount, orderId, service, name, email, phone, description]);

  const serviceLabel = SERVICE_LABELS[service] || service;

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", fontFamily: "Inter,sans-serif" }}>
      <h2>Payment for {serviceLabel}</h2>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      <p>Phone: {phone}</p>
      <p>Description: {description}</p>
      <p>Amount: PKR {Number(amount).toLocaleString()}</p>

      {payload && apiUrl && (
        <form id="jazzcashForm" method="POST" action={apiUrl}>
          {Object.keys(payload).map((key) => (
            <input key={key} type="hidden" name={key} value={payload[key]} />
          ))}
          <button
            type="submit"
            style={{
              padding: "12px 20px",
              backgroundColor: "#ff6600",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              marginTop: 20,
            }}
          >
            Pay with JazzCash
          </button>
        </form>
      )}
    </div>
  );
              }
