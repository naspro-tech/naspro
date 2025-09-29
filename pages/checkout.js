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

  const price =
    service && SERVICE_PRICES[service]
      ? SERVICE_PRICES[service] === 0
        ? 'Custom Pricing - Contact Us'
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleProceed() {
    if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    router.push({
      pathname: '/payment',
      query: { service, ...formData },
    });
  }

  if (!service) return <p style={{ padding: 20, textAlign: 'center' }}>Loading service details...</p>;

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout - {SERVICE_LABELS[service]}</h1>
      <p className="checkout-price"><strong>Price:</strong> {price}</p>

      <form className="checkout-form">
        <label>Name*:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>
        <label>Email*:
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </label>
        <label>Phone*:
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="03XXXXXXXXX" />
        </label>
        <label>CNIC (last 6 digits)*:
          <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} maxLength={6} />
        </label>
        <label>Description (optional):
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </label>

        {errorMsg && <p className="error">{errorMsg}</p>}

        <button type="button" onClick={handleProceed}>Proceed to Payment</button>
      </form>

      <style jsx>{`
        .checkout-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 20px;
          background: #fdfdfd;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        .checkout-title {
          font-size: 1.6rem;
          color: #333;
          margin-bottom: 10px;
        }
        .checkout-price {
          font-size: 1.1rem;
          margin-bottom: 20px;
        }
        .checkout-form label {
          display: block;
          margin-bottom: 15px;
          font-weight: 500;
        }
        .checkout-form input,
        .checkout-form textarea {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }
        .checkout-form button {
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
        .checkout-form button:hover {
          background-color: #e65c00;
        }
        .error {
          color: red;
          margin-top: 5px;
        }
        @media (max-width: 600px) {
          .checkout-container {
            padding: 15px;
            margin: 15px;
          }
        }
      `}</style>
    </div>
  );
                                                }
    
