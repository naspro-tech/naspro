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

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

  // Countdown Timer
  useEffect(() => {
    if (step !== "input") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
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

    // Immediately show approval message (without waiting for response)
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

      if (data.responseCode === "0000") {
        // Show success message and close page after 5s
        setStep("success");
        setMessage("✅ آپ کی ادائیگی کامیاب ہوگئی ہے۔ صفحہ 5 سیکنڈ میں بند ہو جائے گا۔");

        setTimeout(() => {
          window.close();
        }, 5000);
      } else {
        setMessage("درخواست ناکام ہوگئی، دوبارہ کوشش کریں۔");
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
    <div className="container">
      <div className="card">
        <div className="logo">
          <img src="/images.jpeg" alt="Easypaisa Logo" />
        </div>

        {step === "input" && (
          <>
            <h2 className="urdu-text">خوش آمدید</h2>
            <p className="urdu-subtext">
              اگر آپ ٹیلی نار کے علاوہ کسی اور نیٹ ورک سے ہیں تو براہ کرم{" "}
              <strong>ایزی پیسہ ایپ</strong> میں جا کر اپنی ادائیگی کی منظوری دیں۔
            </p>

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

            <button
              className="submit-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>

            <p className="timer">
              ⏰ Session time left: <strong>{formatTime(timeLeft)}</strong>
            </p>
          </>
        )}

        {step === "guide" && (
          <div className="guide-box">
            <h3>📱 براہ کرم منظوری دیں</h3>
            <p>
              اپنی <strong>Easypaisa</strong> ایپ کھولیں، “My Approvals” میں جائیں، اور{" "}
              PKR {amount} کی ادائیگی منظور کریں۔
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
            <p>براہ کرم صفحہ ریفریش کر کے دوبارہ کوشش کریں۔</p>
          </div>
        )}

        {message && <p className="status">{message}</p>}
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #000000, #1f2937, #0f172a, #111827, #4b5563);
          background-size: 400% 400%;
          animation: gradientMove 10s ease infinite;
          padding: 15px;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .card {
          background: rgba(255, 255, 255, 0.97);
          border-radius: 18px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          padding: 25px 20px;
          width: 100%;
          max-width: 380px;
          text-align: center;
        }
        .logo img {
          width: 150px;
          border-radius: 10px;
          margin-bottom: 15px;
        }
        .urdu-text {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1e3a8a;
        }
        .urdu-subtext {
          font-size: 0.9rem;
          color: #334155;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .form-group {
          text-align: left;
          margin-bottom: 15px;
        }
        label {
          display: block;
          font-size: 0.9rem;
          color: #111827;
          margin-bottom: 4px;
        }
        input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          text-align: center;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(90deg, #0f172a, #1e3a8a, #3b82f6);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: 0.3s;
        }
        .submit-btn:hover {
          background: linear-gradient(90deg, #3b82f6, #1e3a8a, #0f172a);
          transform: scale(1.03);
        }
        .timer {
          color: #f59e0b;
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .guide-box, .success-box, .expired-box {
          padding: 18px;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .guide-box { background: #ecfdf5; color: #065f46; }
        .success-box { background: #f0fdf4; color: #15803d; }
        .expired-box { background: #fff7ed; color: #b91c1c; }
        .status {
          margin-top: 12px;
          color: #4b5563;
          font-size: 0.9rem;
        }
        @media (max-width: 480px) {
          .card {
            padding: 20px 15px;
          }
          .logo img {
            width: 130px;
          }
          .urdu-text {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
    }
          
