import { useState } from 'react';

export default function InquireEasypay() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/easypay/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Inquiry failed');
      }

      // Interpret Easypaisa status
      const status = data.transactionStatus || data.responseCode || '';
      let statusMessage = '';

      if (status === '0000' || status.toLowerCase() === 'paid') {
        statusMessage = '✅ Transaction Successful';
      } else {
        statusMessage = '❌ Transaction Failed';
      }

      setResult({
        statusMessage,
        data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Easypaisa Transaction Inquiry</h2>

      <form onSubmit={handleInquiry} style={styles.form}>
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Checking...' : 'Inquire'}
        </button>
      </form>

      {error && <div style={styles.error}>❌ {error}</div>}

      {result && (
        <div style={styles.card}>
          <h3>{result.statusMessage}</h3>
          <pre style={styles.json}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '15px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  json: {
    fontSize: '13px',
    backgroundColor: '#f4f4f4',
    padding: '10px',
    borderRadius: '6px',
    overflowX: 'auto',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px',
  },
};
                      
