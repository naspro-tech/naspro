'use client';

import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const description = searchParams.get('description');

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#ff6600' }}>Thank You for Your Order!</h1>
      <p>We have received your request. We'll contact you shortly.</p>

      <div style={{ background: '#fffae6', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Order Summary:</h3>
        <p><strong>Service:</strong> {service || 'Unknown'}</p>
        <p><strong>Description:</strong></p>
        <p>{description || 'No description provided.'}</p>
      </div>
    </div>
  );
}
