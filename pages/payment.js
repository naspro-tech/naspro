import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const SERVICE_LABELS = {
  webapp: 'Web & App Development',
  domainhosting: 'Domain & Hosting',
  branding: 'Branding & Logo Design',
  ecommerce: 'E-Commerce Solutions',
  cloudit: 'Cloud & IT Infrastructure',
  digitalmarketing: 'Digital Marketing',
};

export default function PaymentPage() {
  const router = useRouter();
  const { service, amount, name, email, phone, description } = router.query;
  const [payload,setPayload] = useState(null);
  const [apiUrl,setApiUrl] = useState("");
  const [orderId,setOrderId] = useState("");

  useEffect(()=>{
    if(service && amount){
      const timestamp = Date.now().toString().slice(-5);
      const randomNum = Math.floor(Math.random()*900+100);
      setOrderId(`NASPRO-${timestamp}-${randomNum}`);

      fetch("/api/jazzcash_payment",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ amount:Number(amount), description:`Payment for ${SERVICE_LABELS[service]||service} - ${name}`, mobileNumber:phone, name,email,service })
      })
      .then(r=>r.json())
      .then(data=>{
        if(data.success && data.payload){
          setPayload(data.payload);
          setApiUrl(data.apiUrl);
        } else alert("Failed to generate JazzCash payment.");
      }).catch(err=>{console.error(err); alert("Error generating JazzCash payment.");});
    }
  },[service,amount,name,email,phone]);

  const handleJazzCashPayment=(e)=>{
    e.preventDefault();
    if(!payload||!apiUrl) return alert("Payment is not ready yet.");
    document.getElementById("jazzcashForm").submit();
  };

  if(!payload) return <p>Loading payment...</p>;

  return (
    <div style={{ maxWidth:600,margin:"30px auto",padding:20,fontFamily:"'Inter', sans-serif" }}>
      <h2 style={{ textAlign:"center" }}>Payment</h2>
      <div style={{ background:"#f9f9f9", padding:20, borderRadius:12 }}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Service:</strong> {SERVICE_LABELS[service]||service}</p>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Description:</strong> {description||"N/A"}</p>
        <p><strong>Amount:</strong> PKR {Number(amount).toLocaleString()}</p>
      </div>

      <form id="jazzcashForm" method="POST" action={apiUrl}>
        {Object.keys(payload).map(key=>(
          <input key={key} type="hidden" name={key} value={payload[key]} />
        ))}
      </form>

      <button
        onClick={handleJazzCashPayment}
        style={{ marginTop:20,padding:"12px",width:"100%",backgroundColor:"#ff6600",color:"#fff",fontSize:"1rem",borderRadius:8,border:"none",cursor:"pointer" }}
      >Pay with JazzCash</button>
    </div>
  );
}
