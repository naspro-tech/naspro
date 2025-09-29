import { useState } from "react";
import { useRouter } from "next/router";

export default function Payment() {
  const router = useRouter();
  const { service, amount, name, email, phone, cnic, description } = router.query;

  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [proof, setProof] = useState({ txnNo: "", accountName: "", accountNumber: "", screenshot: null });
  const [processingJazzCash, setProcessingJazzCash] = useState(false);
  const [error, setError] = useState("");

  const handleMethodSelect = (method) => {
    if (method === "easypaisa") {
      alert("Easypaisa payment will be available soon!");
      return;
    }
    
    if (method === "jazzcash") {
      processJazzCashPayment();
      return;
    }
    
    setSelectedMethod(method);
  };

  const processJazzCashPayment = async () => {
    setProcessingJazzCash(true);
    setError("");

    try {
      const response = await fetch('/api/jazzcash-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          description: `Payment for ${service} - ${name}`,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          service: service
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Create and submit form to JazzCash
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.jazzcash_url;
        
        Object.keys(data.form_data).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.form_data[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        setError('Failed to initialize JazzCash payment. Please try again.');
      }
    } catch (error) {
      console.error('JazzCash payment error:', error);
      setError('Payment initialization failed. Please try again.');
    } finally {
      setProcessingJazzCash(false);
    }
  };

  const handleProofChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "screenshot") {
      setProof((prev) => ({ ...prev, screenshot: files[0] }));
    } else {
      setProof((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitProof = () => {
    router.push({
      pathname: "/thankyou",
      query: {
        service: service,
        amount: amount,
        payment_method: selectedMethod
      },
    });
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 15 }}>Payment - {service}</h1>
      <p><strong>Amount:</strong> PKR {amount}</p>
      <p><strong>Customer:</strong> {name} ({phone})</p>

      {error && (
        <div style={{ color: "red", marginBottom: 15, padding: "10px", background: "#ffe6e6", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      {!selectedMethod && (
        <div style={{ marginTop: 20 }}>
          <h3>Select Payment Method:</h3>
          <button style={buttonStyle} onClick={() => handleMethodSelect("bank")}>
            Bank Transfer
          </button>
          
          <button 
            style={buttonStyle} 
            onClick={() => handleMethodSelect("jazzcash")}
            disabled={processingJazzCash}
          >
            {processingJazzCash ? "Processing..." : "JazzCash"}
          </button>
          
          <button 
            style={{...buttonStyle, backgroundColor: '#ccc', cursor: 'not-allowed'}} 
            onClick={() => handleMethodSelect("easypaisa")}
          >
            Easypaisa (Coming Soon)
          </button>

          {processingJazzCash && (
            <div style={{ marginTop: 15, textAlign: 'center' }}>
              <p>Redirecting to JazzCash...</p>
              <div style={spinnerStyle}></div>
            </div>
          )}
        </div>
      )}

      {selectedMethod === "bank" && !paymentDone && (
        <div style={{ marginTop: 20 }}>
          <h3>Bank Transfer Details:</h3>
          <p><strong>Bank Name:</strong> JS Bank</p>
          <p><strong>Account Title:</strong> NASPRO PRIVATE LIMITED</p>
          <p><strong>Account Number:</strong> 0002810102</p>
          <button style={buttonStyle} onClick={() => setPaymentDone(true)}>
            I have completed the payment
          </button>
        </div>
      )}

      {paymentDone && (
        <div style={{ marginTop: 20 }}>
          <h3>Submit Payment Proof:</h3>
          <label style={labelStyle}>
            Transaction Number*:
            <input type="text" name="txnNo" value={proof.txnNo} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Name*:
            <input type="text" name="accountName" value={proof.accountName} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Account Number*:
            <input type="text" name="accountNumber" value={proof.accountNumber} onChange={handleProofChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Upload Screenshot*:
            <input type="file" name="screenshot" onChange={handleProofChange} style={inputStyle} />
          </label>
          <button style={buttonStyle} onClick={handleSubmitProof}>
            Submit Proof
          </button>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 600,
  margin: "20px auto",
  padding: 20,
  background: "#f9f9f9",
  borderRadius: 12,
  boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
  fontFamily: "'Inter', sans-serif",
  color: "#333",
};

const buttonStyle = {
  backgroundColor: "#ff6600",
  color: "#fff",
  padding: "12px 20px",
  margin: "10px 5px 0 0",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "1rem",
  minWidth: "150px",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const labelStyle = {
  display: "block",
  marginBottom: 15,
};

const spinnerStyle = {
  border: "4px solid #f3f3f3",
  borderTop: "4px solid #ff6600",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  animation: "spin 1s linear infinite",
  margin: "10px auto",
};
