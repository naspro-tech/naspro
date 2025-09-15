import { useState } from 'react';

export default function CheckoutPage() {
  const [form, setForm] = useState({
    service_key: '',
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const errs = {};
    if (!form.service_key) errs.service_key = 'Service is required';
    if (!form.name || form.name.length < 3) errs.name = 'Full name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone || form.phone.length < 10) errs.phone = 'Valid phone required';
    if (!form.description || form.description.length < 10) errs.description = 'Description required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        const text = await response.text();
        // The API returns HTML form to redirect to JazzCash
        document.open();
        document.write(text);
        document.close();
      } else {
        // Handle error
        const msg = await response.text();
        alert('Error: ' + msg);
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <label>Service Key</label>
        <input name="service_key" value={form.service_key} onChange={handleChange} required />
        {errors.service_key && <p className="error">{errors.service_key}</p>}

        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        {errors.name && <p className="error">{errors.name}</p>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />
        {errors.phone && <p className="error">{errors.phone}</p>}

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />
        {errors.description && <p className="error">{errors.description}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Redirecting...' : 'Pay with JazzCash'}
        </button>
      </form>
    </div>
  );
}
