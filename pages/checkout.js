import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const SERVICE_PRICES = {
  webapp: 30000,
  domainhosting: 3500,
  branding: 5000,
  ecommerce: 50000,
  cloudit: 0,  // Custom pricing
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

  const [price, setPrice] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    cnic: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (service && SERVICE_PRICES.hasOwnProperty(service)) {
      const p = SERVICE_PRICES[service];
      setPrice(p === 0 ? 'Custom Pricing - Please contact us' : `PKR ${p.toLocaleString()}`);
    }
  }, [service]);

  if (!service) {
    return <p style={{ padding: 20, textAlign: 'center' }}>Loading service details...</p>;
  }

  if (!SERVICE_PRICES.hasOwnProperty(service)) {
    return <p style={{ padding: 20, textAlign: 'center', color: 'red' }}>Invalid service selected.</p>;
  }

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMsg('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg('Please fill in all required fields, including CNIC.');
      return;
    }

    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg('CNIC must be exactly 6 digits.');
      return;
    }

    // Optional: check for cloudit custom pricing service, prevent checkout
    if (service === 'cloudit') {
      setErrorMsg('Please contact us for custom pricing on Cloud & IT Infrastructure.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_key: service,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          description: formData.description || '',
          cnic: formData.cnic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.redirectUrl) {
        // If your backend returns a redirect URL, redirect the user
        window.location.href = data.redirectUrl;
      } else if (data.htmlForm) {
        // If backend returns HTML form for redirection
        document.open();
        document.write(data.htmlForm);
        document.close();
      } else {
        setErrorMsg('Unexpected response from server.');
        setLoading(false);
      }

    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setLoading(false);
    }
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
