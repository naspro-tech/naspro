import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { txnRef } = router.query;
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!txnRef) return;

    async function fetchPaymentStatus() {
      try {
        const res = await fetch('/api/inquire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txnRefNo: txnRef }),
        });
        const result = await res.json();

        if (!res.ok) {
          setPaymentStatus({ success: false, message: result.message || 'Failed to fetch status' });
        } else {
          const resp = result.jazzCashResponse;
          const success = resp.pp_ResponseCode === '000' || resp.pp_ResponseCode === '121';
          setPaymentStatus({
            success,
            message: resp.pp_ResponseMessage,
            amount: (parseInt(resp.pp_Amount, 10)/100).toFixed(2),
            txnRef: resp.pp_TxnRefNo,
            retrievalRef: resp.pp_RetreivalReferenceNo
          });
        }
      } catch (err) {
        setPaymentStatus({ success: false, message: 'Network error while checking payment' });
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentStatus();
  }, [txnRef]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 80 }}><h2>Loading your payment status...</h2></div>;
  }

  if (!paymentStatus) return null;

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: 30, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      {paymentStatus.success ? (
        <>
          <h1 style={{ color: '#28a745' }}>🎉 Payment Successful!</h1>
          <p style={{ fontSize: '1.2rem', marginTop: 10 }}>Thank you for your payment.</p>
        </>
      ) : (
        <>
          <h1 style={{ color: '#dc3545' }}>❌ Payment Failed</h1>
          <p style={{ fontSize: '1.1rem', marginTop: 10 }}>{paymentStatus.message}</p>
        </>
      )}
      <p style={{ marginTop: 20 }}>
        <strong>Transaction Reference:</strong><br />
        <span style={{ fontSize: '1.1rem', color: '#555' }}>{paymentStatus.txnRef}</span>
      </p>
      <p>
        <strong>Amount:</strong> PKR {paymentStatus.amount || '0.00'}
      </p>
      <p>
        <strong>Retrieval Reference:</strong> {paymentStatus.retrievalRef || '-'}
      </p>
      <button onClick={() => router.push('/')} style={{ marginTop: 30, backgroundColor: '#ff6600', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: 8, fontSize: '1rem', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
      }
