async function handleSubmit(e) {
  e.preventDefault();

  setErrorMsg('');

  if (!formData.name || !formData.email || !formData.phone || !formData.cnic) {
    setErrorMsg('Please fill in all required fields.');
    return;
  }

  if (!/^\d{6}$/.test(formData.cnic)) {
    setErrorMsg('CNIC must be exactly 6 digits.');
    return;
  }

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
        cnic: formData.cnic,
        description: formData.description || '',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error || 'Payment failed.');
      setLoading(false);
      return;
    }

    // ✅ Redirect user to JazzCash payment page
    if (data.redirectURL) {
      window.location.href = data.redirectURL;
    } else {
      setErrorMsg('Missing payment URL from JazzCash.');
      setLoading(false);
    }

  } catch (err) {
    setErrorMsg('Network error. Please try again.');
    setLoading(false);
  }
}
