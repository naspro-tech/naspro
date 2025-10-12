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
  const [closeTimer, setCloseTimer] = useState(5);
  const [fade, setFade] = useState(true);

  const finalService = service || "Easypaisa";

  // Generate orderId
  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // Session countdown (10 minutes)
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

  // Auto close timer after success
  useEffect(() => {
    if (step === "success") {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setFade(true);
          setCloseTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              window.close();
              return 0;
            }
            return prev - 1;
          });
        }, 400);
      }, 1000);
      return () => clearInterval(interval);
    }
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
        {/* Header with logo */}
        <div className="card-header">
          <div className="logo-wrap">
            <img src="/images.jpeg" alt="Easypaisa Logo" />
          </div>
        </div>

        <div className="card-body">
          {step === "input" && (
            <>
              <h2 className="urdu-text">خوش آمدید</h2>
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

              <div className="timer-below">⏰ سیشن وقت: {formatTime(timeLeft)}</div>
            </>
          )}

          {step === "guide" && (
            <div className="guide-box">
              <h3>📱 براہ کرم منظوری دیں</h3>
              <p className="approval-text">{message}</p>
            </div>
          )}

          {step === "success" && (
            <div className="success-box">
              <h3>✅ ادائیگی مکمل</h3>
              <p>{message}</p>
              <p className={`countdown ${fade ? "fade-in" : "fade-out"}`}>
                صفحہ {closeTimer} سیکنڈ میں بند ہو جائے گا۔
                <span className="close-icon" onClick={() => window.close()}>✖</span>
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
          padding: 20px;
          background: linear-gradient(
            45deg,
            #0b1220,
            #072540,
            #2b0f3a,
            #1f2937,
            #0b1220
          );
          background-size: 400% 400%;
          animation: colorShift 1s linear infinite;
        }

        @keyframes colorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .card {
          width: 100%;
          max-width: 440px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 12px 40px rgba(2,6,23,0.6);
          overflow: hidden;
        }

        .card-header {
          padding: 0;
          background: #fff;
        }

        .logo-wrap img {
          width: 100%;
          height: 120px;
          object-fit: contain;
          display: block;
        }

        .card-body {
          padding: 20px;
        }

        .urdu-text {
          text-align: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .urdu-subtext {
          text-align: center;
          direction: rtl;
          font-size: 1rem;
          color: #374151;
          margin-bottom: 18px;
          line-height: 1.8;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .form-group label {
          font-size: 0.9rem;
          color: #111827;
          margin-bottom: 6px;
        }

        input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          text-align: center;
          font-size: 1rem;
        }

        .submit-btn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(90deg, #0ea5a6, #075985);
        }

        .timer-below {
          margin-top: 12px;
          text-align: center;
          font-weight: 600;
          color: #0f172a;
        }

        .guide-box, .success-box, .expired-box {
          margin-top: 15px;
          padding: 14px;
          border-radius: 10px;
          font-size: 1rem;
          text-align: center;
        }

        .guide-box { background: #f8fafc; color: #064e3b; }
        .success-box { background: #ecfccb; color: #14532d; }
        .expired-box { background: #fff7ed; color: #7c2d12; }

        .approval-text {
          direction: rtl;
          text-align: center;
          line-height: 2;
          font-size: 1rem;
        }

        .countdown {
          margin-top: 10px;
          direction: rtl;
          text-align: center;
          font-weight: 600;
          transition: opacity 0.4s ease-in-out;
        }

        .fade-in { opacity: 1; }
        .fade-out { opacity: 0.3; }

        .close-icon {
          margin-right: 8px;
          cursor: pointer;
          font-size: 1.2rem;
        }

        @media (max-width: 520px) {
          .card { max-width: 96%; }
        }
      `}</style>
    </div>
  );
                   }
          
