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
      alert("رقم درست نہیں ہے۔ براہ کرم دوبارہ چیک کریں۔");
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
        setMessage("براہ کرم اپنی Easypaisa App میں جا کر ادائیگی منظور کریں۔");
      } else {
        setMessage("درخواست ناکام ہوگئی، دوبارہ کوشش کریں۔");
      }
    } catch (err) {
      console.error(err);
      setMessage("خرابی پیدا ہوگئی، دوبارہ کوشش کریں۔");
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
        <img
          src="https://seeklogo.com/images/E/easypaisa-digital-bank-logo-0E28D573C4-seeklogo.com.png"
          alt="Easypaisa Logo"
          className="logo"
        />

        {step === "input" && (
          <>
            <h2 className="urdu-text">خوش آمدید</h2>
            <p className="urdu-subtext">
              اگر آپ ٹیلی نور کے علاوہ کسی اور نیٹ ورک سے ہیں تو براہ کرم{" "}
              <strong>EasyPaisa App</strong> میں جا کر پیمنٹ کو اپروو کریں۔
            </p>

            <div className="form-group">
              <label>Name</label>
              <input type="text" value={orderId.slice(-9)} disabled />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input type="text" value={amount || "0.00"} disabled />
            </div>

              <div className="form-group">
                <label>Mobile</label>
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
                {loading ? "Processing..." : "Submit Amount"}
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
              اپنی <strong>Easypaisa App</strong> کھولیں، "My Approvals" میں جائیں، اور
              PKR {amount} کی درخواست کو منظور کریں۔
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
          background: linear-gradient(135deg, #0173b2, #f16b3a);
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          padding: 30px 25px;
          width: 100%;
          max-width: 380px;
          text-align: center;
        }
        .logo {
          width: 160px;
          margin: 0 auto 15px;
        }
        .urdu-text {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .urdu-subtext {
          font-size: 0.9rem;
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
          margin-bottom: 5px;
          color: #333;
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
          background: #6d28d9;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.3s;
        }
        .submit-btn:hover {
          background: #7c3aed;
        }
        .timer {
          color: #f59e0b;
          margin-top: 12px;
          font-size: 0.9rem;
        }
        .guide-box {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 10px;
          color: #065f46;
        }
        .expired-box {
          background: #fff7ed;
          padding: 20px;
          border-radius: 10px;
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
    
