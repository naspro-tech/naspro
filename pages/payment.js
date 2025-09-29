import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function Payment() {
  const router = useRouter();
  const { service, name, email, phone, cnic, description } = router.query;

  const SERVICE_PRICES = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const SERVICE_LABELS = {
    webapp: "Web & App Development",
    domainhosting: "Domain & Hosting",
    branding: "Branding & Logo Design",
    ecommerce: "E-Commerce Solutions",
    cloudit: "Cloud & IT Infrastructure",
    digitalmarketing: "Digital Marketing",
  };

  const [selectedMethod, setSelectedMethod] = useState("bank");
  const [showBankDetails, setShowBankDetails] = useState(true);

  const amount = SERVICE_PRICES[service] || 0;
  const serviceLabel = SERVICE_LABELS[service] || "";

  useEffect(() => {
    setShowBankDetails(selectedMethod === "bank");
  }, [selectedMethod]);

  function handleProceed() {
    router.push({
      pathname: "/thankyou",
      query: { service, name, email, phone, cnic, description, amount },
    });
  }

  return (
    <div className="payment-container">
      <h1 className="payment-title">Payment - {serviceLabel}</h1>
      <p className="payment-price"><strong>Amount:</strong> PKR {amount.toLocaleString()}</p>

      <div className="payment-methods">
        <label>
          <input
            type="radio"
            name="payment"
            value="bank"
            checked={selectedMethod === "bank"}
            onChange={() => setSelectedMethod("bank")}
          />
          Bank Transfer
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="easypaisa"
            checked={selectedMethod === "easypaisa"}
            onChange={() => setSelectedMethod("easypaisa")}
          />
          Easypaisa (Coming Soon)
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="jazzcash"
            checked={selectedMethod === "jazzcash"}
            onChange={() => setSelectedMethod("jazzcash")}
          />
          JazzCash (Coming Soon)
        </label>
      </div>

      {selectedMethod !== "bank" && (
        <p className="coming-soon">This payment method will be available soon.</p>
      )}

      {showBankDetails && (
        <div className="bank-details">
          <p><strong>Bank Name:</strong> ABC Bank</p>
          <p><strong>Account Title:</strong> Naspro Technologies</p>
          <p><strong>Account Number:</strong> 1234567890</p>
          <p><strong>Amount to Transfer:</strong> PKR {amount.toLocaleString()}</p>
          <p>Please keep your transaction number and details to submit in the next step.</p>
        </div>
      )}

      <button onClick={handleProceed}>Proceed</button>

      <style jsx>{`
        .payment-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 20px;
          background: #fdfdfd;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        .payment-title {
          font-size: 1.6rem;
          color: #333;
          margin-bottom: 10px;
        }
        .payment-price {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        .payment-methods label {
          display: block;
          margin-bottom: 12px;
          font-weight: 500;
          cursor: pointer;
        }
        .payment-methods input {
          margin-right: 10px;
        }
        .coming-soon {
          margin-top: 10px;
          color: #ff6600;
          font-weight: 600;
        }
        .bank-details {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: #f9f9f9;
        }
        .bank-details p {
          margin: 5px 0;
        }
        button {
          margin-top: 20px;
          width: 100%;
          padding: 12px;
          background-color: #ff6600;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover {
          background-color: #e65c00;
        }
        @media (max-width: 600px) {
          .payment-container {
            padding: 15px;
            margin: 15px;
          }
        }
      `}</style>
    </div>
  );
}
