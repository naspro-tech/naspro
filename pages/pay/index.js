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
                code: "0000",
                order_id: orderId,
                amount: order.amount,
                username: order.username,
                service: order.service,
                gateway: "Easypaisa",
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (err) {
            console.error("Merchant callback error:", err);
          }
        }
      }
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

              <div className="fields">
                <div className="field">
                  <label>Order Number</label>
                  <input type="text" value={orderId} disabled />
                </div>

                <div className="field">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={String(order?.amount || "0.00")}
                    disabled
                    dir="ltr"
                  />
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
              >
                {loading ? "Processing..." : "Submit Amount"}
              </button>

              <div className="session-timer">
                ⏰ سیشن وقت: <strong>{formatMMSS(sessionTime)}</strong>
              </div>
            </>
          )}

          {step === "guide" && (
            <div className="guide">
              <h2>📱 براہ کرم منظوری دیں</h2>
              <p className="approval" dir="rtl">
                براہ کرم اپنی <strong>Easypaisa</strong> ایپ کھولیں،
                <strong>"My Approvals"</strong> پر جائیں،
                اور رقم <span dir="ltr">PKR {order?.amount}</span> کی ادائیگی
                <strong> منظور کریں</strong>۔
              </p>
              <p className="note">
                جب آپ نے ادائیگی منظور کر دی تو یہ صفحہ خود بخود بند ہو جائے گا۔
              </p>
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
        /* your same CSS here (unchanged) */
      `}</style>
    </div>
  );
          }
