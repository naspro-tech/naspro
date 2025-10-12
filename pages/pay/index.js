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

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // countdown timer (10 minutes)
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

    // Immediately show “please approve” message (don’t wait for response)
    setStep("guide");
    setMessage("براہ کرم اپنی Easypaisa App میں جا کر My Approvals میں ادائیگی کی منظوری دیں۔");

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
        setTimeout(() => window.close(), 5000);
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
        {/* Header with logo + timer */}
        <div className="card-header">
          <div className="logo-wrap">
            <img src="/images.jpeg" alt="Easypaisa Logo" />
          </div>
          <div className="timer-pill">⏰ {formatTime(timeLeft)}</div>
        </div>

        <div className="card-body">
          {step === "input" && (
            <>
              <h2 className="urdu-text">خوش آمدید</h2>
              <p className="urdu-subtext">
                اگر آپ ٹیلی نار یا کسی دوسرے نیٹ ورک سے ہیں تو براہ کرم اپنی{" "}
                <strong>ایزی پیسہ ایپ</strong> میں جا کر ادائیگی منظوری دیں۔
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
              <p>
                اپنی <strong>Easypaisa</strong> ایپ کھولیں، "My Approvals" میں
                جائیں، اور PKR {amount} کی ادائیگی منظور کریں۔ جب ادائیگی مکمل
                ہو جائے گی تو یہ صفحہ خود بخود بند ہو جائے گا۔
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="success-box">
              <h3>✅ ادائیگی مکمل</h3>
              <p>{message}</p>
            </div>
          )}

          {step === "expired" && (
            <div className="expired-box">
              <h3>⏰ سیشن ختم ہوگیا</h3>
              <p>براہ کرم صفحہ ریفریش کریں اور دوبارہ کوشش کریں۔</p>
            </div>
          )}

          {message && step !== "success" && (
            <p className="status">{message}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Background with fast dual-multi color animation */
        .page-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(45deg, #0a0f1e, #003a47, #2b0040, #004d3d);
          background-size: 400% 400%;
          animation: colorShift 4s ease infinite;
        }

        @keyframes colorShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .card {
          width: 100%;
          max-width: 440px;
          border-radius: 18px;
          background: #ffffffee;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          position: relative;
        }

        .card-header {
          position: relative;
          background: #fff;
          padding: 0;
        }

        .logo-wrap {
          width: 100%;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-wrap img {
          width: 100%;
          height: 80px;
          object-fit: contain;
        }

        .timer-pill {
          position: absolute;
          top: 8px;
          right: 10px;
          background: linear-gradient(90deg, #111827, #1f2937);
          color: #fff;
          padding: 5px 12px;
          border-radius: 999px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .card-body {
          padding: 20px;
        }

        .urdu-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .urdu-subtext {
          font-size: 0.9rem;
          color: #374151;
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        label {
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1rem;
          text-align: center;
        }

        .submit-btn {
          margin-top: 12px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #047857, #0ea5a6, #065f46);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 8px 20px rgba(4, 120, 87, 0.3);
          transition: all 0.2s ease;
        }

        .submit-btn:hover {
          transform: scale(1.02);
        }

        .guide-box,
        .success-box,
        .expired-box {
          margin-top: 10px;
          padding: 14px;
          border-radius: 10px;
          line-height: 1.5;
        }

        .guide-box {
          background: #f8fafc;
        }

        .success-box {
          background: #ecfccb;
          color: #14532d;
        }

        .expired-box {
          background: #fff7ed;
          color: #7c2d12;
        }

        .status {
          margin-top: 12px;
          font-size: 0.95rem;
          color: #374151;
        }

        @media (max-width: 520px) {
          .card {
            max-width: 96%;
          }
          .logo-wrap img {
            height: 64px;
          }
        }
      `}</style>
    </div>
  );
}
