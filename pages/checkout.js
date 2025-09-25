// /pages/checkout.js - CLEANED (Removed autoSubmitToJazzCash)
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const SERVICE_PRICES = {
  webapp: 30000,
  domainhosting: 3500,
  branding: 5000,
  ecommerce: 50000,
  cloudit: 0,
  digitalmarketing: 15000,
};

const SERVICE_LABELS = {
  webapp: 'Web & App Development',
  domainhosting: 'Domain & Hosting',
  branding: 'Branding & Logo Design',
  ecommerce: 'E-Commerce & Payment Solutions',
  cloudit: 'Cloud & IT Infrastructure',
  digitalmarketing: 'Digital Marketing',
};

export default function Checkout() {
  const router = useRouter();
  const { service } = router.query;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    description: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const price = service && SERVICE_PRICES.hasOwnProperty(service)
    ? SERVICE_PRICES[service] === 0
      ? 'Custom Pricing - Please contact us'
      : `PKR ${SERVICE_PRICES[service].toLocaleString()}`
    : '';

  useEffect(() => {
    if (!service) return;
    if (!SERVICE_PRICES.hasOwnProperty(service)) {
      setErrorMsg('Invalid service selected.');
    } else {
      setErrorMsg('');
    }
  }, [service]);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    // Basic validation - KEEP 6-digit CNIC
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg('CNIC must be exactly 6 digits (last 6 digits).');
      return;
    }
    if (service === 'cloudit') {
      setErrorMsg('Please contact us for custom pricing on Cloud & IT Infrastructure.');
      return;
    }

    setLoading(true);

    try {
      // Call backend API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          service_key: service, 
          ...formData
          // Let backend handle invoice number generation
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.error || result.message || 'Payment initiation failed.');
        setLoading(false);
        return;
      }

      // ✅ Only handle JazzCash response, no autoSubmitToJazzCash
      if (result.jazzCashResponse) {
        if (result.jazzCashResponse.pp_ResponseCode === '000') {
          // Redirect to thank you page
          router.push(`/thankyou?txnRef=${result.jazzCashResponse.pp_TxnRefNo}`);
        } else {
          setErrorMsg(`JazzCash Error: ${result.jazzCashResponse.pp_ResponseMessage}`);
          setLoading(false);
        }
      } else {
        setErrorMsg('Unexpected response from payment gateway.');
        setLoading(false);
      }

    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setLoading(false);
    }
  }

  if (!service) {
    return <p style={{ padding: 20, textAlign: 'center' }}>Loading service details...</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p><strong>Price:</strong> {price}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label>
          Name*:<br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginBottom: 15, borderRadius: 5, border: '1px solid #ccc' }}
          />
        </label>

        <label>
          Email*:<br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginBottom: 15, borderRadius: 5, border: '1px solid #ccc' }}
          />
        </label>

        <label>
          Phone*:<br />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="03\d{9}"
            placeholder="03XXXXXXXXX"
            style={{ width: '100%', padding: 8, marginBottom: 15, borderRadius: 5, border: '1px solid #ccc' }}
          />
        </label>

        <label>
          CNIC (last 6 digits)*:<br />
          <input
            type="text"
            name="cnic"
            value={formData.cnic}
            onChange={handleChange}
            required
            maxLength={6}
            pattern="\d{6}"
            placeholder="Enter last 6 digits of CNIC"
            style={{ width: '100%', padding: 8, marginBottom: 15, borderRadius: 5, border: '1px solid #ccc' }}
          />
        </label>

        <label>
          Description (optional):<br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: 8, marginBottom: 15, borderRadius: 5, border: '1px solid #ccc' }}
          />
        </label>

        {errorMsg && <p style={{ color: 'red', marginBottom: 15 }}>{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#ff6600',
            color: '#fff',
            padding: '12px 25px',
            fontSize: '1rem',
            borderRadius: 6,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
          }}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}
