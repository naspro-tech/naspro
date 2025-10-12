import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HostedEasypaisaPortal() {
  const router = useRouter();
  const { amount, service, merchant } = router.query;

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [step, setStep] = useState("input"); // input | guide | done
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5); // for closing after done
  const [timeLeft, setTimeLeft] = useState(600); // ⏱ 10 minutes (600 seconds)

  const finalService = service || "Easypaisa"; // ✅ Default service name

  // Generate Order ID once router ready
  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // Auto-close countdown
  useEffect(() => {
    if (step === "done") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // ⏰ Front page 10-minute countdown timer
  useEffect(() => {
    if (step !== "input") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handlePayment = async () => {
    if (!/^03\d{9}$/.test(mobile)) {
      alert("Please enter a valid Easypaisa mobile number (e.g. 03XXXXXXXXX)");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Invalid or missing amount. Please check your link.");
      return;
    }

    setLoading(true);
    setStep("guide");
    setMessage("Sending payment request to Easypaisa...");

    try {
      const res = await fetch("/api/easypay/initiate-ma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          transactionAmount: Number(amount),
          mobileAccountNo: mobile.trim(),
          emailAddress: "naspropvt@gmail.com",
          optional1: finalService,
        }),
      });

      const data = await res.json();
      console.log("Easypaisa Response:", data);

      if (data.responseCode === "0000") {
        setMessage("✅ Payment request sent! Please approve in your Easypaisa app.");

        const interval = setInterval(async () => {
          const check = await fetch("/api/easypay/inquire", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const result = await check.json();
          console.log("Easypaisa Status:", result);

          if (result.responseCode === "0000") {
            clearInterval(interval);
            setStep("done");
            setMessage("✅ Payment confirmed successfully!");
            const orderData = {
              orderId,
              amount,
              service: finalService,
              mobile,
              merchant: merchant || "NasPro Pvt",
              payment_method: "Easypaisa",
            };
            localStorage.setItem("lastOrder", JSON.stringify(orderData));
          }
        }, 5000);
      } else {
        setMessage(`❌ ${data.responseDesc || "Failed to start transaction"}`);
        setStep("input");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error initiating payment. Please try again.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1>💚 Easypaisa Payment Portal</h1>
        <p className="subtitle">
          Powered by <strong>{merchant || "NasPro Pvt"}</strong>
        </p>

        {/* Show timer only when on input page */}
        {step === "input" && (
          <p className="timer">
            ⏰ Session expires in <strong>{formatTime(timeLeft)}</strong>
          </p>
        )}

        <div className="info-box">
          <p><strong>Service:</strong> {finalService}</p>
          <p><strong>Amount:</strong> PKR {amount || "0"}</p>
        </div>

        {step === "input" && (
          <>
            <label className="input-label">Enter your Easypaisa number:</label>
            <input
              type="tel"
              className="mobile-input"
              placeholder="03XXXXXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={11}
            />
            <button className="pay-btn" onClick={handlePayment} disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </>
        )}

        {step === "guide" && (
          <div className="guide-box">
            <h3>📱 Approve Your Payment</h3>
            <ol>
              <li>Open your <strong>Easypaisa</strong> App.</li>
              <li>Go to <strong>“My Approvals”</strong> on the home screen.</li>
              <li>Find the pending request for PKR {amount}.</li>
              <li>Tap <strong>Approve</strong> to complete your transaction.</li>
            </ol>
            <p className="waiting">⏳ Waiting for confirmation...</p>
          </div>
        )}

        {step === "done" && (
          <div className="success-box">
            <h3>✅ Payment Successful!</h3>
            <p>Thank you for your payment.</p>
            <p>This page will close in <strong>{countdown}</strong> seconds.</p>
          </div>
        )}

        {step === "expired" && (
          <div className="expired-box">
            <h3>⏰ Session Expired</h3>
            <p>Your session has timed out. Please refresh the page to start again.</p>
          </div>
        )}

        {message && <p className="status-msg">{message}</p>}
      </div>

      <style jsx>{`
        .portal-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 20px;
        }
        .portal-card {
          background: #111827;
          color: #f8fafc;
          border-radius: 15px;
          padding: 30px 25px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }
        h1 {
          color: #22c55e;
          margin-bottom: 5px;
          font-size: 1.6rem;
        }
        .subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        .timer {
          color: #facc15;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .info-box {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 25px;
        }
        .input-label {
          display: block;
          text-align: left;
          color: #cbd5e1;
          margin-bottom: 6px;
          font-size: 0.95rem;
        }
        .mobile-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #1e293b;
          color: #f8fafc;
          margin-bottom: 15px;
          font-size: 1rem;
          text-align: center;
          letter-spacing: 1px;
        }
        .pay-btn {
          width: 100%;
          background: linear-gradient(135deg, #22c55e, #15803d);
          border: none;
          color: #fff;
          padding: 14px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .pay-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
        }
        .guide-box {
          text-align: left;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 20px;
        }
        .guide-box ol {
          margin: 10px 0;
          padding-left: 20px;
          line-height: 1.6;
        }
        .waiting {
          text-align: center;
          color: #facc15;
          margin-top: 10px;
        }
        .success-box {
          text-align: center;
          color: #22c55e;
        }
        .expired-box {
          color: #f87171;
          background: rgba(255, 0, 0, 0.1);
          border-radius: 10px;
          padding: 15px;
        }
        .status-msg {
          margin-top: 20px;
          font-size: 0.95rem;
          color: #facc15;
        }
      `}</style>
    </div>
  );
          }
          
