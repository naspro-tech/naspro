import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Payment() {
  const router = useRouter();
  const { service, name, email, phone, cnic, description } = router.query;

  const [method, setMethod] = useState('');
  const [proof, setProof] = useState({ txnNumber:'', accName:'', accNumber:'', screenshot:null });
  const [errorMsg, setErrorMsg] = useState('');

  const SERVICE_PRICES = {
    webapp: 30000,
    domainhosting: 3500,
    branding: 5000,
    ecommerce: 50000,
    cloudit: 0,
    digitalmarketing: 15000,
  };

  const SERVICE_LABELS = {
    webapp: 'Web & App Development',
    domainhosting: 'Domain & Hosting',
    branding: 'Branding & Logo Design',
    ecommerce: 'E-Commerce Solutions',
    cloudit: 'Cloud & IT Infrastructure',
    digitalmarketing: 'Digital Marketing',
  };

  const amount = SERVICE_PRICES[service];

  useEffect(() => {
    if (!service || !name) router.push('/');
  }, [service, name]);

  function handleMethodSelect(m) {
    if(m==='easypaisa' || m==='jazzcash'){
      alert('This payment method will be available soon.');
      return;
    }
    setMethod(m);
  }

  function handleChange(e) {
    setProof(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e){
    setProof(prev=>({ ...prev, screenshot: e.target.files[0] }));
  }

  function handleSubmit(e){
    e.preventDefault();
    if(!proof.txnNumber || !proof.accName || !proof.accNumber || !proof.screenshot){
      setErrorMsg('Please fill all proof details and upload screenshot.');
      return;
    }
    const formData = { service, name, email, phone, cnic, description, amount, method, proof: {...proof, screenshot: proof.screenshot.name} };
    router.push({ pathname:'/thankyou', query: formData });
  }

  return (
    <div className="container">
      <h1>Payment - {SERVICE_LABELS[service]}</h1>
      <p><strong>Amount:</strong> PKR {amount.toLocaleString()}</p>
      <h3>Select Payment Method:</h3>
      <div className="btn-group">
        <button onClick={()=>handleMethodSelect('bank')} className="button">Bank Transfer</button>
        <button onClick={()=>handleMethodSelect('easypaisa')} className="button">Easypaisa</button>
        <button onClick={()=>handleMethodSelect('jazzcash')} className="button">JazzCash</button>
      </div>

      {method==='bank' && (
        <div className="bank-form">
          <h3>Bank Transfer Details:</h3>
          <p>Bank Name: JS Bank</p>
          <p>Account Title: NASPRO PRIVATE LIMITED</p>
          <p>Account Number: 0002810102</p>
          <form onSubmit={handleSubmit}>
            <label>Transaction Number*:<input type="text" name="txnNumber" value={proof.txnNumber} onChange={handleChange} className="input"/></label>
            <label>Account Name*:<input type="text" name="accName" value={proof.accName} onChange={handleChange} className="input"/></label>
            <label>Account Number*:<input type="text" name="accNumber" value={proof.accNumber} onChange={handleChange} className="input"/></label>
            <label>Upload Screenshot*:<input type="file" onChange={handleFileChange} className="input"/></label>
            {errorMsg && <p className="error">{errorMsg}</p>}
            <button type="submit" className="button">I have completed the payment</button>
          </form>
        </div>
      )}

      <style jsx>{`
        .container { max-width:600px; margin:30px auto; padding:20px; background:#f8f9fa; border-radius:10px; }
        .btn-group { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .button { flex:1; padding:12px; background:#ff6600; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600; }
        .input { display:block; width:100%; padding:10px; margin-top:6px; margin-bottom:12px; border-radius:6px; border:1px solid #ccc; }
        .bank-form { margin-top:20px; background:#fff3e0; padding:15px; border-radius:8px; }
        .error { color:red; margin-bottom:12px; }
        @media (max-width: 600px) { .btn-group { flex-direction:column; } }
      `}</style>
    </div>
  );
                  }
  
