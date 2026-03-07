import PortalLayout from "../../components/PortalLayout";

export default function Links() {

  const domain = "https://naspropvt.vercel.app";

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"30px"}}>
        API Documentation
      </h1>

      {/* CREATE PAYMENT */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Create Payment</h2>

        <p><b>Endpoint:</b></p>
        <pre>{domain}/api/create-payment</pre>

        <p><b>Method:</b> POST</p>

        <p><b>Body Example:</b></p>

<pre>
{`{
  "amount": 1000,
  "username": "customer123",
  "callback_url": "https://merchant-site.com/callback"
}`}
</pre>

        <p><b>Response Example:</b></p>

<pre>
{`{
  "payment_url": "https://naspropvt.vercel.app/pay?orderId=NASPRO-123456"
}`}
</pre>

      </div>


      {/* HOSTED PAYMENT PAGE */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Hosted Payment Page</h2>

        <p>Customer completes payment on:</p>

        <pre>
https://naspropvt.vercel.app/pay?orderId=NASPRO-XXXX
        </pre>

      </div>


      {/* CHECK STATUS */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Check Order Status</h2>

        <p><b>Endpoint:</b></p>

        <pre>
https://naspropvt.vercel.app/api/order/get?orderId=NASPRO-XXXX
        </pre>

        <p><b>Method:</b> GET</p>

        <p><b>Response Example:</b></p>

<pre>
{`{
  "order_id": "NASPRO-123456",
  "amount": 1000,
  "status": "PAID"
}`}
</pre>

      </div>


      {/* CALLBACK */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", borderRadius:"10px"}}>

        <h2>Payment Callback</h2>

        <p>After successful payment, we send a callback to merchant:</p>

<pre>
{`{
  "order_id": "NASPRO-123456",
  "amount": 1000,
  "status": "PAID"
}`}
</pre>

      </div>

    </PortalLayout>
  );
        }
