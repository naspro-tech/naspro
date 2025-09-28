import { useRouter } from 'next/router';
import { useState } from 'react';

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
  ecommerce: 'E-Commerce Solutions',
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

  const price = service && SERVICE_PRICES[service]
    ? `PKR ${SERVICE_PRICES[service].toLocaleString()}`
    : '';

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleProceed() {
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    router.push({
      pathname: '/payment',
      query: {
        service,
        ...formData,
      },
    });
  }

  if (!service) return <p>Loading service details...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 20, background: '#fff', borderRadius: 10 }}>
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p><strong>Price:</strong> {price}</p>

      <label>Name*:
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </label>
      <label>Email*:
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </label>
      <label>Phone*:
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
      </label>
      <label>CNIC (last 6 digits)*:
        <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} maxLength={6} />
      </label>
      <label>Description (optional):
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
      </label>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <button onClick={handleProceed}>Proceed to Payment</button>
    </div>
  );
                                            }
