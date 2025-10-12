import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HostedEasypaisaPortal() {
  const router = useRouter();
  const { amount, service } = router.query;

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [step, setStep] = useState("input");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // Session countdown (10 min)
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

  // Auto-close countdown
  useEffect(() => {
    if (step === "success") {
      setShowCloseButton(true);
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
        setMessage("✅ آپ کی ادائیگی کامیاب ہوگئی ہے۔");
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
        <div className="logo-wrap">
          <img src="/images.jpeg" alt="Easypaisa Logo" />
        </div>

        {/* Body */}
        <div className="card-body">
          {step === "input" && (
            <>
              <h2 className="urdu-text">خوش آمدید</h2>
              <p className="urdu-subtext">
                اگر آپ ٹیلی نار یا کسی دوسرے نیٹ ورک سے ہیں تو براہ کرم اپنی ایزی پیسہ ایپ میں جا کر ادائیگی منظوری دیں۔
                <br />
                براہ کرم اپنا ایزی پیسہ موبائل نمبر درج کریں۔
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
                آپ کی ادائیگی کامیاب ہوگئی ہے۔ صفحہ {closeCountdown} سیکنڈ میں
                بند ہو جائے گا۔
              </p>

              {showCloseButton && (
                <button className="close-btn" onClick={() => window.close()}>
                  Close Page
                </button>
              )}
            </div>
          )}

          {step === "expired" && (
            <div className="expired-box">
              <h3>⏰ سیشن ختم ہوگیا</h3>
              <p>براہ کرم صفحہ ریفریش کریں اور دوبارہ کوشش کریں۔</p>
            </div>
          )}
        </div>

        {/* Bottom Timer */}
        {step === "input" && (
          <div className="timer-bottom">
            ⏰ سیشن وقت باقی ہے: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, #0b1220, #2b0f3a, #0b3a4a, #1f2937);
          background-size: 600% 600%;
          animation: gradientMove 1s linear infinite;
          padding: 10px;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .card {
          width: 100%;
          max-width: 440px;
          border-radius: 16px;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .logo-wrap {
          background: #fff;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .card-body {
          padding: 10px 16px;
          text-align: center;
        }

        .urdu-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
        }
        .urdu-subtext {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .form-grid {
          display: grid;
          gap: 8px;
        }
        .form-group label {
          font-size: 0.85rem;
          color: #111827;
          text-align: left;
          margin-bottom: 4px;
        }
        .form-group input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          text-align: center;
        }

        .submit-btn {
          margin-top: 8px;
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          color: white;
          background: linear-gradient(90deg, #0ea5a6, #075985);
          font-weight: 700;
        }

        .guide-box, .success-box, .expired-box {
          margin-top: 10px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .close-btn {
          margin-top: 10px;
          background: #111827;
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          font-size: 0.9rem;
        }

        .timer-bottom {
          background: #0f172a;
          color: white;
          padding: 6px;
          font-size: 0.85rem;
          text-align: center;
        }

        @media (max-height: 720px) {
          .card { transform: scale(0.9); }
        }
        @media (max-height: 600px) {
          .card { transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
    }
      
