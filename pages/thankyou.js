import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { service, name, phone, cnic, email, amount, method, proof } = router.query;

  useEffect(() => {
    if (!service || !name) router.push('/');
  }, [service, name]);

  return (
    <div className="container">
      <h1>Thank You for Your Order!</h1>
      <p><strong>Service:</strong> {service}</p>
      <p><strong>Amount:</strong> PKR {amount}</p>
      {method==='bank' && proof && (
        <div className="proof">
          <h3>Bank Transfer Proof:</h3>
          <p>Transaction Number: {proof.txnNumber}</p>
          <p>Account Name: {proof.accName}</p>
          <p>Account Number: {proof.accNumber}</p>
          <p>Uploaded Screenshot: {proof.screenshot}</p>
        </div>
      )}
      <h4>Our Contact Info</h4>
      <p>Email: info@naspro.com</p>
      <p>Phone: 0312-3456789</p>
      <button onClick={()=>router.push('/')} className="button">Back to Home</button>

      <style jsx>{`
        .container { max-width:600px; margin:30px auto; padding:20px; background:#f8f9fa; border-radius:10px; text-align:center; }
        .button { padding:12px; background:#ff6600; color:#fff; border:none; border-radius:6px; cursor:pointer; margin-top:15px; }
        .proof { background:#fff3e0; padding:15px; border-radius:8px; margin-top:15px; }
      `}</style>
    </div>
  );
    }
    
