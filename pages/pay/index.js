import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HostedEasypaisaPortal() {
  const router = useRouter();
  const { amount, service } = router.query;

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [step, setStep] = useState("input"); // input | guide | success | expired
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [countdown, setCountdown] = useState(5);

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // session timer (10 minutes)
  useEffect(() => {
    if (step !== "input") return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setStep("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const handlePayment = async () => {
    if (!/^03\d{9}$/.test(mobile)) {
      alert("براہ کرم درست ایزی پیسہ نمبر درج کریں (مثلاً 03XXXXXXXXX)");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("براہ کرم درست رقم درج کریں۔");
      return;
    }

    setLoading(true);
    setStep("guide");
    setMessage(
      `براہ کرم اپنی Easypaisa ایپ کھولیں، "My Approvals" پر جائیں۔ اور رقم PKR ${amount} کی ادائیگی کی منظوری دیں۔`
    );

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

      if (data && data.responseCode === "0000") {
        setStep("success");
        setMessage("✅ آپ کی ادائیگی کامیاب ہوگئی ہے۔ صفحہ 5 سیکنڈ میں بند ہو جائے گا۔");

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              window.close();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setMessage("خرابی پیدا ہوگئی، براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className="page-bg">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="logo-wrap">
            <img src="/images.jpeg" alt="Easypaisa Logo" />
          </div>
        </div>

        {/* Timer always visible below header */}
        <div className="timer-section">⏰ {formatTime(timeLeft)}</div>

        <div className="card-body">
          {step === "input" && (
            <>
              <h2 className="urdu-heading">خوش آمدید</h2>
              <p className="urdu-subtext">
                براہ کرم اپنا ایزی پیسہ موبائل نمبر درج کریں اور نیچے دی گئی رقم کی تصدیق کریں۔
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Order Number</label>
                  <input type="text" value={orderId.slice(-9)} disabled />
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input type="text" value={amount || "0.00"} disabled />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="submit-btn"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </>
          )}

          {step === "guide" && (
            <div className="guide-box">
              <h3>📱 براہ کرم منظوری دیں</h3>
              <p>{message}</p>
            </div>
          )}

          {step === "success" && (
            <div className="success-box">
              <h3>✅ ادائیگی مکمل</h3>
              <p>
                {message} ({countdown}){" "}
                <button
                  className="close-btn"
                  onClick={() => window.close()}
                >
                  Close Page
                </button>
              </p>
            </div>
          )}

          {step === "expired" && (
            <div className="expired-box">
              <h3>⏰ سیشن ختم ہوگیا</h3>
              <p>براہ کرم صفحہ ریفریش کریں اور دوبارہ کوشش کریں۔</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(45deg, #0b1220, #1f2937, #0b3a4a, #2b0f3a);
          background-size: 600% 600%;
          animation: gradientShift 1s linear infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .card {
          width: 100%;
          max-width: 440px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          overflow: hidden;
        }

        .card-header {
          background: #fff;
        }

        .logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 120px;
          width: 100%;
          background: #fff;
        }

        .logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .timer-section {
          text-align: center;
          color: #fff;
          font-weight: 600;
          margin: 8px 0;
          font-size: 1rem;
        }

        .card-body {
          padding: 16px;
          text-align: center;
        }

        .urdu-heading {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 4px;
          color: #0f172a;
        }

        .urdu-subtext {
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 12px;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .form-group {
          text-align: left;
        }

        label {
          font-size: 0.85rem;
          color: #111827;
        }

        input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          text-align: center;
        }

        .submit-btn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #0ea5a6, #075985);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }

        .guide-box,
        .success-box,
        .expired-box {
          background: #f9fafb;
          padding: 14px;
          border-radius: 10px;
          margin-top: 12px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #2563eb;
          font-weight: bold;
          cursor: pointer;
        }

        @media (max-width: 520px) {
          .card {
            max-width: 100%;
          }
          .logo-wrap {
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
    }
           
