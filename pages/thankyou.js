// /pages/thankyou.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { txnRef } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (txnRef) {
      setLoading(false);
    }
  }, [txnRef]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <h2>Loading your payment status...</h2>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: '80px auto',
      padding: '30px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#28a745' }}>🎉 Payment Successful!</h1>
      <p style={{ fontSize: '1.2rem', marginTop: 10 }}>
        Thank you for your payment.
      </p>
      <p style={{ marginTop: 20 }}>
        <strong>Transaction Reference:</strong><br />
        <span style={{ fontSize: '1.1rem', color: '#555' }}>{txnRef}</span>
      </p>
      <button
        onClick={() => router.push('/')}
        style={{
          marginTop: 30,
          backgroundColor: '#ff6600',
          color: '#fff',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 8,
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
