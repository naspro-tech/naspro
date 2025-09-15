import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const serviceNames = {
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

  const [form, setForm] = useState({
    service_key: service || '',
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (service && serviceNames[service]) {
      setForm((f) => ({ ...f, service_key: service }));
    }
  }, [service]);

  const validate = () => {
    const errs = {};
    if (!form.service_key || !serviceNames[form.service_key]) errs.service_key = 'Please select a valid service';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.phone.trim() || !/^\+?\d{7,15}$/.test(form.phone)) errs.phone = 'Valid phone number is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      // The API returns HTML form that auto-submits to JazzCash; replace page content:
      const html = await res.text();
      document.open();
      document.write(html);
      document.close();

    } catch (error) {
      setSubmitError(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: '20px', background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#ff6600', marginBottom: 20 }}>Checkout</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="service_key">Select Service</label>
        <select
          id="service_key"
          name="service_key"
          value={form.service_key}
          onChange={handleChange}
          disabled={!!service} // disable if preset via query
          style={{ width: '100%', padding: '8px', marginBottom: errors.service_key ? 5 : 15 }}
        >
          <option value="">-- Select a Service --</option>
          {Object.entries(serviceNames).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {errors.service_key && <small style={{ color: 'red' }}>{errors.service_key}</small>}

        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: errors.name ? 5 : 15 }}
        />
        {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: errors.email ? 5 : 15 }}
        />
        {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+923001234567"
          value={form.phone}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: errors.phone ? 5 : 15 }}
        />
        {errors.phone && <small style={{ color: 'red' }}>{errors.phone}</small>}

        <label htmlFor="description">Description / Notes</label>
        <textarea
          id="description"
          name="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', marginBottom: errors.description ? 5 : 15 }}
        />
        {errors.description && <small style={{ color: 'red' }}>{errors.description}</small>}

        {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

        <button type="submit" disabled={loading} style={{
          backgroundColor: '#ff6600',
          color: 'white',
          padding: '12px 20px',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          width: '100%',
          fontSize: '1rem',
        }}>
          {loading ? 'Processing...' : 'Pay with JazzCash'}
        </button>
      </form>
    </div>
  );
}
