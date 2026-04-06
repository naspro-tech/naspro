import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HostedEasypaisaPortal() {
  const router = useRouter();

  const { orderId, service, amount, callback } = router.query;

  const [order, setOrder] = useState(null);
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input"); // input | guide | success | expired
  const [message, setMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(600);
  const [closeCountdown, setCloseCountdown] = useState(5);

  const finalService = service || "Easypaisa";

  // ✅ Load Order (URL mode OR API mode)
  useEffect(() => {
    if (!orderId) return;

    // 🔥 URL MODE (for testing)
    if (amount) {
      const parsedAmount = Number(amount);

      if (!parsedAmount || parsedAmount <= 0) {
        alert("Invalid amount in URL");
        return;
      }

      setOrder({
        orderId,
        amount: parsedAmount,
        status: "UNPAID",
        username: "guest",
        service: finalService,
      });

      return;
    }

    // 🔁 API MODE (production)
    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/order/get?orderId=${orderId}`);
        const data = await response.json();

        if (data.status === "PAID") {
          alert("This payment has already been completed.");
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error("Order fetch error:", err);
      }
    };

    loadOrder();
  }, [orderId, amount, finalService]);

  // ⏰ Session timer
  useEffect(() => {
    if (step !== "input") return;

    const t = setInterval(() => {
      setSessionTime((p) => {
        if (p <= 1) {
          clearInterval(t);
          setStep("expired");
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [step]);

  // ✅ Auto close after success
  useEffect(() => {
    if (step !== "success") return;

    const interval = setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handlePayment = async () => {
    if (!/^03\d{9}$/.test(mobile)) {
      alert("براہ کرم درست ایزی پیسہ نمبر درج کریں (03XXXXXXXXX)");
      return;
    }

    if (!order?.amount || Number(order.amount) <= 0) {
      alert("Invalid amount");
      return;
    }

    setLoading(true);
    setStep("guide");

    setMessage(
      `براہ کرم Easypaisa ایپ کھولیں اور PKR ${order.amount} کی منظوری دیں۔`
    );

    try {
      const res = await fetch("/api/easypay/initiate-ma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          transactionAmount: Number(order.amount),
          mobileAccountNo: mobile.trim(),
          emailAddress: "naspropvt@gmail.com",
          optional1: finalService,
        }),
      });

      const data = await res.json();

      if (data?.responseCode === "0000") {
        setStep("success");
        setMessage("✅ ادائیگی کامیاب ہوگئی");

        // 🔔 Callback
        if (callback) {
          try {
            await fetch(callback, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "SUCCESS",
                code: "0000",
                order_id: orderId,
                amount: order.amount,
                service: finalService,
                gateway: "Easypaisa",
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (err) {
            console.error("Callback error:", err);
          }
        }
      } else {
        setStep("input");
        alert("Payment failed: " + data?.responseMessage);
      }
    } catch (err) {
      console.error(err);
      setStep("input");
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatMMSS = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" + sec : sec}`;
  };

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading order...
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {step === "input" && (
        <>
          <h2>Payment Page</h2>

          <p>Order ID: {orderId}</p>
          <p>Amount: PKR {order.amount}</p>

          <input
            placeholder="03XXXXXXXXX"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <br /><br />

          <button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>

          <p>⏰ {formatMMSS(sessionTime)}</p>
        </>
      )}

      {step === "guide" && <p>{message}</p>}

      {step === "success" && (
        <>
          <h3>{message}</h3>
          <p>Closing in {closeCountdown}s...</p>
        </>
      )}

      {step === "expired" && (
        <p>Session expired. Please refresh.</p>
      )}
    </div>
  );
                     }
