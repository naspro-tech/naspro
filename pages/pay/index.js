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
    setMessage("درخواست بھیجی جا رہی ہے...");

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
        setStep("guide");
        setMessage("براہ کرم اپنی Easypaisa ایپ میں جا کر ادائیگی منظور کریں۔");
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
              <label>آرڈر نمبر</label>
              <input type="text" value={orderId.slice(-9)} disabled />
            </div>

            <div className="form-group">
              <label>رقم (روپے)</label>
              <input type="text" value={amount || "0.00"} disabled />
            </div>

            <div className="form-group">
              <label>موبائل نمبر</label>
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
              {loading ? "عمل جاری ہے..." : "رقم جمع کریں"}
            </button>

            <p className="timer">
              ⏰ سیشن ختم ہونے میں وقت: <strong>{formatTime(timeLeft)}</strong>
            </p>
          </>
        )}

        {step === "guide" && (
          <div className="guide-box">
            <h3>📱 ادائیگی کی منظوری دیں</h3>
            <p>
              اپنی <strong>Easypaisa</strong> ایپ کھولیں، "My Approvals" میں جائیں،
              اور PKR {amount} کی درخواست کو منظور کریں۔
            </p>
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
          background: linear-gradient(135deg, #007d3d, #00c853, #0173b2, #f16b3a);
          background-size: 400% 400%;
          animation: gradientMove 10s ease infinite;
          padding: 20px;
        }
        @keyframes gradientMove {
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
          background: white;
          border-radius: 18px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          padding: 35px 25px;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .logo img {
          width: 160px;
          margin-bottom: 18px;
          border-radius: 10px;
        }
        .urdu-text {
          font-size: 1.3rem;
          font-weight: bold;
          color: #047857;
          margin-bottom: 8px;
        }
        .urdu-subtext {
          font-size: 0.9rem;
          margin-bottom: 20px;
          line-height: 1.7;
          color: #374151;
        }
        .form-group {
          text-align: right;
          margin-bottom: 15px;
        }
        label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: #111827;
        }
        input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          text-align: center;
          direction: ltr;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(90deg, #007d3d, #00c853);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s;
        }
        .submit-btn:hover {
          background: linear-gradient(90deg, #00c853, #007d3d);
          transform: translateY(-2px);
        }
        .timer {
          color: #ea580c;
          margin-top: 12px;
          font-size: 0.9rem;
        }
        .guide-box {
          background: #ecfdf5;
          padding: 20px;
          border-radius: 12px;
          color: #065f46;
        }
        .expired-box {
          background: #fff7ed;
          padding: 20px;
          border-radius: 12px;
          color: #b91c1c;
        }
        .status {
          margin-top: 15px;
          font-size: 0.95rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
  }
