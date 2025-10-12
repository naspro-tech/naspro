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
  const [timeLeft, setTimeLeft] = useState(5);
  const [showClose, setShowClose] = useState(false);

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!router.isReady) return;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900 + 100);
    setOrderId(`NASPRO-${timestamp}-${random}`);
  }, [router.isReady]);

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
    setStep("guide");
    setMessage(
      `براہ کرم اپنی Easypaisa ایپ کھولیں، "My Approvals" پر جائیں، اور PKR ${amount} کی ادائیگی کی منظوری دیں۔`
    );
  };

  useEffect(() => {
    if (step === "success") {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
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

  const handleManualClose = () => {
    window.close();
  };

  const formatTime = (seconds) => `${seconds}s`;

  return (
    <div className="container">
      <div className="card">
        <div className="logo">
          <img src="/easypaisa-logo.png" alt="Easypaisa Logo" />
        </div>

        {step === "input" && (
          <>
            <h2 className="urdu-text">خوش آمدید</h2>
            <p className="urdu-subtext">
              براہ کرم اپنا ایزی پیسہ نمبر درج کریں اور نیچے دی گئی رقم کی تصدیق کریں۔
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
          </>
        )}

        {step === "guide" && (
          <div className="guide-box">
            <h3>📱 ادائیگی کی منظوری دیں</h3>
            <p className="urdu-guide">
              براہ کرم اپنی Easypaisa ایپ کھولیں، "My Approvals" پر جائیں، اور PKR{" "}
              {amount} کی ادائیگی کی منظوری دیں۔
            </p>

            <button
              className="success-btn"
              onClick={() => setStep("success")}
            >
              Complete Payment
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="success-box">
            <h3>✅ ادائیگی مکمل ہوگئی</h3>
            <p>صفحہ {formatTime(timeLeft)} میں خود بخود بند ہوجائے گا۔</p>
            <button onClick={handleManualClose} className="close-btn">
              Close Page
            </button>
          </div>
        )}

        {message && <p className="status">{message}</p>}
      </div>

      <style jsx>{`
        @keyframes gradientShift {
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

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #6a11cb, #2575fc);
          background-size: 400% 400%;
          animation: gradientShift 6s ease infinite;
        }

        .card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
          padding: 20px;
          width: 100%;
          max-width: 380px;
          text-align: center;
        }

        .logo img {
          width: 100%;
          height: 120px;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .urdu-text {
          font-size: 1.3rem;
          font-weight: bold;
          text-align: center;
          margin: 5px 0;
        }

        .urdu-subtext {
          font-size: 0.95rem;
          margin-bottom: 15px;
        }

        .form-group {
          text-align: left;
          margin-bottom: 10px;
        }

        label {
          display: block;
          font-size: 0.85rem;
          color: #444;
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
          background: #6d28d9;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
        }

        .guide-box,
        .success-box {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 10px;
          margin-top: 10px;
        }

        .urdu-guide {
          font-size: 1rem;
          line-height: 1.7;
          color: #065f46;
        }

        .success-btn,
        .close-btn {
          background: #6d28d9;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          margin-top: 10px;
          font-weight: bold;
        }

        @media (max-width: 400px) {
          .card {
            padding: 15px;
            transform: scale(0.95);
          }
          .logo img {
            height: 110px;
          }
        }
      `}</style>
    </div>
  );
          }
          
