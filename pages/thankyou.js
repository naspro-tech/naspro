import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (router.query) setData(router.query);
  }, [router.query]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 20, background: '#fff', borderRadius: 10 }}>
      <h1>Thank You!</h1>
      <p>Your order has been submitted successfully.</p>

      <h3>Order Details:</h3>
      <p><strong>Service:</strong> {data.service}</p>
      <p><strong>Customer Name:</strong> {data.name}</p>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Phone:</strong> {data.phone}</p>
      <p><strong>CNIC:</strong> {data.cnic}</p>
      <p><strong>Description:</strong> {data.description}</p>

      <h3>Payment Details:</h3>
      <p><strong>Method:</strong> {data.paymentMethod}</p>
      <p><strong>Transaction Number:</strong> {data.txnNumber}</p>
      <p><strong>Account Name:</strong> {data.accountName}</p>
      <p><strong>Account Number:</strong> {data.accountNumber}</p>
      {data.screenshot && <p><strong>Screenshot:</strong> {data.screenshot}</p>}

      <h3>Contact Info:</h3>
      <p>Email: naspropvt@gmail.com</p>
      <p>Phone: +92 303 3792494</p>
    </div>
  );
}
