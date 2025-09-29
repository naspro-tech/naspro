const processJazzCashPayment = async () => {
  setProcessingJazzCash(true);
  setError("");

  try {
    // Show loading immediately
    console.log("🟡 Starting JazzCash payment process...");
    
    const response = await fetch('/api/jazzcash-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseInt(amount),
        description: `Payment for ${service} - ${name}`,
        customer_name: name,
        customer_phone: phone,
        service: service
      }),
    });

    console.log("🟡 API Response received:", response.status);
    
    const data = await response.json();
    console.log("🟡 API Data:", data);
    
    if (data.success) {
      console.log("🟡 Creating form for JazzCash redirect...");
      
      // Create form dynamically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.jazzcash_url;
      form.style.display = 'none';
      
      // Add all parameters as hidden inputs
      Object.entries(data.form_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Add form to page and submit
      document.body.appendChild(form);
      console.log("🟡 Form created with", Object.keys(data.form_data).length, "fields");
      form.submit();
      
    } else {
      throw new Error(data.error || 'Unknown API error');
    }
  } catch (error) {
    console.error('🔴 JazzCash payment failed:', error);
    setError('Payment failed: ' + error.message);
    
    // Show alert for mobile debugging
    if (typeof alert !== 'undefined') {
      alert('Payment Error: ' + error.message);
    }
  } finally {
    setProcessingJazzCash(false);
  }
};
