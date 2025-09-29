import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Payment() {
  const router = useRouter();
  const { service, name, email, phone, cnic, description } = router.query;

  const [paymentDetails, setPaymentDetails] = useState({
    txnNumber: '',
    accountName: '',
    accountNumber: '',
    screenshot: null,
  });
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    if (e.target.name === 'screenshot') {
      setPaymentDetails({ ...paymentDetails, screenshot: e.target.files[0] });
    } else {
      setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    }
  }

  function handleSubmit() {
    if (!paymentDetails.txnNumber || !paymentDetails.accountName || !paymentDetails.accountNumber) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    // Redirect to thank you page with details
    const query = {
      service,
      name,
      email,
      phone,
      cnic,
      description,
      paymentMethod: 'Bank Transfer',
      ...paymentDetails,
      screenshot: paymentDetails.screenshot ? paymentDetails.screenshot.name : null,
    };
    router.push({ pathname: '/thankyou', query });
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 20, background: '#fff', borderRadius: 10 }}>
      <h1>Payment Page</h1>
      <p>Select payment method:</p>

      <button disabled style={{ marginRight: 10 }}>JazzCash (Coming Soon)</button>
      <button disabled style={{ marginRight: 10 }}>Easypaisa (Coming Soon)</button>
      <button style={{ background: '#eee', marginTop: 10, padding: 10 }}>Bank Transfer</button>

      <h3>Bank Transfer Details:</h3>
      <p><strong>Bank:</strong> ABC Bank</p>
      <p><strong>Account Number:</strong> 1234567890</p>
      <p><strong>Amount:</strong> 30000 PKR</p>

      <h3>Submit Payment Proof</h3>
      <label>Transaction Number*:
        <input type="text" name="txnNumber" onChange={handleChange} />
      </label>
      <label>Account Name*:
        <input type="text" name="accountName" onChange={handleChange} />
      </label>
      <label>Account Number*:
        <input type="text" name="accountNumber" onChange={handleChange} />
      </label>
      <label>Upload Screenshot:
        <input type="file" name="screenshot" onChange={handleChange} />
      </label>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <button onClick={handleSubmit}>Submit Payment</button>
    </div>
  );
  }
  
