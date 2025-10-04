import { useState, useEffect } from "react";
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

  const [order, setOrder] = useState({
    service: "",
    amount: 0,
    name: "",
    email: "",
    phone: "",
    description: "",
  });
  const [orderId, setOrderId] = useState("");
  const [payload, setPayload] = useState(null);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    if (service && amount) {
      setOrder({ service, amount, name, email, phone, description });
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random() * 900 + 100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);
    }
  }, [service, amount, name, email, phone, description]);

  useEffect(() => {
    // Call backend to get payload
    if (order.amount && orderId) {
      fetch("/api/jazzcash_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(order.amount),
          description: order.description || "",
          orderId,
          mobileNumber: order.phone,
          name: order.name,
          email: order.email,
          service: order.service,
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
  }, [order, orderId]);

  const serviceLabel = SERVICE_LABELS[order.service] || order.service;

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", fontFamily: "Inter,sans-serif" }}>
      <h2>Payment for {serviceLabel}</h2>
      <p>Name: {order.name}</p>
      <p>Email: {order.email}</p>
      <p>Phone: {order.phone}</p>
      <p>Description: {order.description}</p>
      <p>Amount: PKR {Number(order.amount).toLocaleString()}</p>

      {/* Only render form if payload is ready */}
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
              
