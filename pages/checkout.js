// example fetch from checkout page
await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ service_key, name, email, phone, description })
});
