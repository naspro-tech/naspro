import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HostedEasypaisaPortal() {
  const router = useRouter();
  const { orderId, service } = router.query;

  const [order, setOrder] = useState(null);
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input"); // input | guide | success | expired
  const [message, setMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(600);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const amount = order?.amount;

  const finalService = service || "Easypaisa";

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      const response = await fetch(`/api/order/get?orderId=${orderId}`);
      const data = await response.json();

      console.log("Order from DB:", data);

      // 🚨 If order already paid
  if (data.status === "PAID") {
    alert("This payment has already been completed.");
    return;
  }
      
      setOrder(data);
    };

    loadOrder();
  }, [orderId]);
  
  // session countdown
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

  // success auto close countdown
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
      alert("براہ کرم درست ایزی پیسہ نمبر درج کریں (مثلاً 03XXXXXXXXX)");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("براہ کرم درست رقم درج کریں۔");
      return;
    }

    setLoading(true);
    setStep("guide");

    // show user-friendly approval message (proper RTL + LTR mixing)
    setMessage(
      `براہ کرم اپنی Easypaisa ایپ کھولیں، "My Approvals" پر جائیں، اور رقم PKR ${amount} کی ادائیگی کی منظوری دیں۔`
    );

    try {
      const res = await fetch("/api/easypay/initiate-ma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          transactionAmount: Number(order?.amount),
          mobileAccountNo: mobile.trim(),
          emailAddress: "naspropvt@gmail.com",
          optional1: finalService,
        }),
      });
      const data = await res.json();

      if (data && data.responseCode === "0000") {
        setStep("success");
        setMessage("✅ آپ کی ادائیگی کامیاب ہوگئی ہے۔");

        // Step 3: Send callback to merchant automatically
      if (router.query.callback) {
        try {
          await fetch(router.query.callback, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "SUCCESS",
              code: "0000", // Easypaisa standard success code
              order_id: orderId,
              amount: order.amount,
              username: order.username,
              service: order.service,
              gateway: "Easypaisa",
              timestamp: new Date().toISOString()
            })
          });
        } catch (err) {
          console.error("Merchant callback error:", err);
        }
      }
      }
      // If your backend uses polling or webhook, you can detect success separately — this keeps current behavior.
    } catch (err) {
      console.error(err);
      setMessage("خرابی پیدا ہوگئی، براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  const handleManualClose = () => window.close();

  const formatMMSS = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div className="page-bg">
      <div className="card" role="main" aria-live="polite">
        {/* LOGO BANNER - uses your uploaded file /public/images.jpeg */}
        <div className="logo-banner" aria-hidden>
          <img src="/images.jpeg" alt="Easypaisa Logo" />
        </div>

        <div className="body">
          {step === "input" && (
            <>
              <h1 className="welcome">خوش آمدید</h1>
              <p className="instruction" dir="rtl">
                براہ کرم اپنا ایزی پیسہ نمبر درج کریں اور نیچے دی گئی رقم کی تصدیق کریں۔
              </p>

              {/* =========== FIELDS - fixed, non-overlapping =========== */}
              <div className="fields">
                <div className="field">
                  <label>Order Number</label>
                  <input type="text" value={orderId} disabled />
                </div>

                <div className="field">
                  <label>Amount</label>
                  {/* show amount as LTR to prevent Urdu wrapping issues */}
                  <input type="text" value={String(order?.amount || "0.00")} disabled dir="ltr" />
                </div>

                <div className="field">
                  <label>Mobile Number</label>
                  <input
                    inputMode="tel"
                    pattern="03[0-9]{9}"
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="submit"
                onClick={handlePayment}
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? "Processing..." : "Submit Amount"}
              </button>

              {/* =========== TIMER - now BELOW submit =========== */}
              <div className="session-timer" aria-hidden>
                ⏰ سیشن وقت: <strong>{formatMMSS(sessionTime)}</strong>
              </div>
            </>
          )}

          {step === "guide" && (
            <div className="guide">
              <h2>📱 براہ کرم منظوری دیں</h2>

              {/* Proper RTL + mixing number as LTR so it doesn't break alignment */}
              <p className="approval" dir="rtl">
                براہ کرم اپنی <strong>Easypaisa</strong> ایپ کھولیں، <strong>"My Approvals"</strong> پر جائیں،
                اور رقم <span dir="ltr">PKR {order?.amount}</span> کی ادائیگی <strong>منظور کریں</strong>۔
              </p>

              <p className="note">جب آپ نے ادائیگی منظور کر دی تو یہ صفحہ خود بخود بند ہو جائے گا۔</p>
            </div>
          )}

          {step === "success" && (
            <div className="success">
              <h2>✅ ادائیگی مکمل</h2>
              <p className="success-msg">{message}</p>

              <p className="closing" dir="rtl">
                صفحہ {closeCountdown} سیکنڈ میں بند ہو جائے گا۔
              </p>

              <button className="close-btn" onClick={handleManualClose}>
                Close Page
              </button>
            </div>
          )}

          {step === "expired" && (
            <div className="expired">
              <h2>⏰ سیشن ختم ہوگیا</h2>
              <p>براہ کرم صفحہ ریفریش کریں اور دوبارہ کوشش کریں۔</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        :root {
          --card-w: 96%;
          --max-w: 420px;
        }

        .page-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: linear-gradient(45deg, #0b1220, #072540, #2b0f3a, #1f2937);
          background-size: 600% 600%;
          animation: bgShift 1s linear infinite;
        }
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .card {
          width: var(--card-w);
          max-width: var(--max-w);
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 12px 36px rgba(2,6,23,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ===== Logo banner (full-width, exact height 120px) ===== */
        .logo-banner {
          height: 120px; /* exact requested height */
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }
        .logo-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* banner fill */
          display: block;
        }

        .body {
          padding: 14px;
        }

        .welcome {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          margin: 6px 0 8px;
          color: #0f172a;
        }

        .instruction {
          text-align: center;
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 10px;
          line-height: 1.45;
        }

        /* ===== fields layout - stacked, equal width, no overlap ===== */
        .fields {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 8px;
        }
        .field label {
          display: block;
          font-size: 0.85rem;
          color: #111827;
          margin-bottom: 6px;
          text-align: left;
        }
        .field input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1rem;
          box-sizing: border-box;
          text-align: center;
          background: #fff;
        }

        .submit {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg, #047857, #0ea5a6);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        }

        .session-timer {
          margin-top: 10px;
          text-align: center;
          font-weight: 600;
          color: #0f172a;
          background: linear-gradient(90deg, #111827, #1f2937);
          padding: 8px 10px;
          border-radius: 8px;
          color: white;
        }

        /* Guide / approval message */
        .guide h2 {
          margin: 0 0 8px 0;
        }
        .approval {
          direction: rtl;
          text-align: center;
          line-height: 1.6;
          font-size: 1rem;
          color: #065f46;
        }
        .note {
          margin-top: 8px;
          color: #374151;
          font-size: 0.95rem;
        }

        /* Success */
        .success h2 { margin-top: 0; }
        .success-msg { color: #14532d; font-weight: 600; }
        .closing { margin-top: 8px; font-weight: 700; }

        .close-btn {
          margin-top: 10px;
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #111827;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .expired h2 { margin-top: 0; }

        @media (max-width: 360px) {
          .card { max-width: 360px; }
          .logo-banner { height: 110px; }
          .welcome { font-size: 1.1rem; }
          .instruction { font-size: 0.9rem; }
          .field input { padding: 9px; font-size: 0.95rem; }
          .submit { padding: 10px; font-size: 0.95rem; }
          .session-timer { padding: 6px; font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
  }
                  
