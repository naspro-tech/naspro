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
    ? SERVICE_PRICES[service] === 0
      ? 'Custom Pricing - Please contact us'
      : `PKR ${SERVICE_PRICES[service].toLocaleString()}`
    : '';

  useEffect(() => {
    if (!service) return;
    if (!SERVICE_PRICES.hasOwnProperty(service)) {
      setErrorMsg('Invalid service selected.');
    } else setErrorMsg('');
  }, [service]);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!/^\d{6}$/.test(formData.cnic)) {
      setErrorMsg('CNIC must be exactly 6 digits (last 6 digits).');
      return;
    }

    router.push({
      pathname: '/payment',
      query: {
        service,
        ...formData
      }
    });
  }

  if (!service) return <p style={{ padding: 20, textAlign: 'center' }}>Loading service...</p>;

  return (
    <div className="container">
      <h1>Checkout - {SERVICE_LABELS[service]}</h1>
      <p><strong>Price:</strong> {price}</p>
      <form onSubmit={handleSubmit}>
        {['name','email','phone','cnic','description'].map(field => (
          <label key={field}>
            {field === 'cnic' ? 'CNIC (last 6 digits)*:' : `${field.charAt(0).toUpperCase()+field.slice(1)}${field!=='description'?'*':''}:`}
            {field === 'description' ? (
              <textarea name={field} value={formData[field]} onChange={handleChange} rows={4} className="input"/>
            ) : (
              <input
                type={field==='email'?'email':field==='phone'?'tel':'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={field!=='description'}
                maxLength={field==='cnic'?6:undefined}
                placeholder={field==='phone'?'03XXXXXXXXX':''}
                className="input"
              />
            )}
          </label>
        ))}
        {errorMsg && <p className="error">{errorMsg}</p>}
        <button type="submit" className="button">Proceed to Payment</button>
      </form>

      <style jsx>{`
        .container { max-width: 600px; margin: 30px auto; padding: 20px; background: #f8f9fa; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .input { width:100%; padding:10px; margin-top:6px; margin-bottom:12px; border-radius:6px; border:1px solid #ccc; font-size:16px; }
        .button { width:100%; padding:12px; background:#ff6600; color:#fff; font-size:16px; border:none; border-radius:6px; cursor:pointer; }
        .error { color:red; margin-bottom:12px; }
        @media (max-width: 600px) { .container { margin:15px; padding:15px; } }
      `}</style>
    </div>
  );
    }
          
