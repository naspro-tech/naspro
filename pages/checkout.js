'use client';

import { useState, useEffect } from 'react';

const serviceMap = {
  webapp: { name: 'Web & App Development', price: 'PKR 30,000' },
  domainhosting: { name: 'Domain & Hosting', price: 'PKR 3,500/year' },
  branding: { name: 'Branding & Logo Design', price: 'PKR 5,000' },
  ecommerce: { name: 'E-Commerce & Payment Solutions', price: 'PKR 50,000' },
  cloudit: { name: 'Cloud & IT Infrastructure', price: 'Custom Pricing' },
  digitalmarketing: { name: 'Digital Marketing', price: 'PKR 15,000/month' }
};

export default function CheckoutPage() {
  const [serviceKey, setServiceKey] = useState('');
  const [service, setService] = useState({ name: '', price: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('service');
    setServiceKey(key);
    if (serviceMap[key]) {
      setService(serviceMap[key]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('service_key', serviceKey);
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('description', formData.description);

    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: form
    });

    const html = await res.text();
    document.open();
    document.write(html);
    document.close();
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#ff6600', textAlign: 'center' }}>Checkout</h1>
      <p style={{ textAlign: 'center' }}><strong>Service:</strong> {service.name || 'Unknown'}</p>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}><strong>Price:</strong> {service.price || '-'}</p>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

        <label>Email</label>
        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

        <label>Phone</label>
        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

        <label>Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>

        <button type="submit" style={{ marginTop: '20px', background: '#ff6600', color: '#fff', padding: '12px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Pay with JazzCash
        </button>
      </form>
    </div>
  );
}
