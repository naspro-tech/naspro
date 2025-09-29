// /pages/thankyou.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { txnRef, service, amount } = router.query;
  const [formData, setFormData] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    transactionID: '',
    screenshot: null,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'screenshot') {
      setFormData((prev) => ({ ...prev, screenshot: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    // Here you can send formData to your backend if needed
  }

  if (!txnRef || !service || !amount) {
    return (
      <div style={containerStyle}>
        <h2>Invalid access</h2>
        <button style={buttonStyle} onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Thank You for Your Order!</h1>
      <p style={{ marginBottom: 20 }}>
        <strong>Order Number:</strong> {txnRef}
      </p>
      <p>
        <strong>Service:</strong> {service}
      </p>
      <p>
        <strong>Amount:</strong> PKR {Number(amount).toLocaleString()}
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <h2 style={{ marginBottom: 15 }}>Bank Transfer Details</h2>
          <label style={labelStyle}>
            Bank Name:
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Account Title:
            <input
              type="text"
              name="accountTitle"
              value={formData.accountTitle}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Account Number:
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Transaction ID:
            <input
              type="text"
              name="transactionID"
              value={formData.transactionID}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Screenshot / Proof:
            <input
              type="file"
              name="screenshot"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>
          <button type="submit" style={buttonStyle}>
            Submit Payment Proof
          </button>
        </form>
      ) : (
        <div style={{ marginTop: 30 }}>
          <h2>Payment Proof Submitted!</h2>
          <p>We have received your bank transfer details.</p>
          <button style={buttonStyle} onClick={() => router.push('/')}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 600,
  margin: '30px auto',
  padding: 20,
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
};

const headingStyle = {
  fontSize: '1.5rem',
  marginBottom: 20,
  color: '#ff6600', // match your website theme
};

const labelStyle = {
  display: 'block',
  marginBottom: 12,
  fontWeight: '500',
};

const inputStyle = {
  width: '100%',
  padding: 10,
  marginTop: 6,
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const buttonStyle = {
  backgroundColor: '#ff6600',
  color: '#fff',
  padding: '12px',
  fontSize: '1rem',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  width: '100%',
  marginTop: 15,
};
        
