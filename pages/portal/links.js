import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Links() {

  const domain = "https://naspropvt.vercel.app";
  const [copied, setCopied] = useState("");

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const createEndpoint = `${domain}/api/easypay/create-payment`;
  const payPage = `${domain}/pay?orderId=NASPRO-XXXX`;
  const statusEndpoint = `${domain}/api/order/get?orderId=NASPRO-XXXX`;

  const requestBody = `{
  "amount": 1000,
  "username": "customer123",
  "service": "Deposit",
  "callback": "https://merchant-site.com/api/payment-callback"
}`;

  const responseExample = `{
  "status": "success",
  "msg": "Order created successfully",
  "data": {
    "order_id": "NASPRO-1730212345678-a1b2c3",
    "order_status": "PENDING",
    "redirect_url": "https://naspropvt.vercel.app/pay?orderId=NASPRO-1730212345678-a1b2c3",
    "amount": 1000,
    "currency": "PKR",
    "created_at": "2026-03-10T19:10:00Z"
  }
}`;

  const callbackPayload = `{
  "status": "SUCCESS",
  "code": "0000",
  "order_id": "NASPRO-1730212345678-a1b2c3",
  "amount": 1000,
  "username": "customer123",
  "service": "Deposit",
  "gateway": "Easypaisa",
  "timestamp": "2026-03-10T19:15:00Z"
}`;

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"30px"}}>
        Payment Gateway API Documentation
      </h1>


      {/* CREATE PAYMENT */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Create Payment</h2>

        <p>This API creates a payment order and returns a hosted payment page.</p>

        <p><b>Endpoint:</b></p>

        <pre>{createEndpoint}</pre>

        <button onClick={() => copy(createEndpoint,"endpoint")}>
          {copied==="endpoint" ? "Copied!" : "Copy Endpoint"}
        </button>

        <p style={{marginTop:"20px"}}><b>Method:</b> POST</p>

        <p><b>Headers:</b></p>

<pre>
Content-Type: application/json
x-api-key: YOUR_API_KEY
</pre>

        <p><b>Request Body:</b></p>

<pre>{requestBody}</pre>

        <button onClick={() => copy(requestBody,"body")}>
          {copied==="body" ? "Copied!" : "Copy Body"}
        </button>

        <p style={{marginTop:"20px"}}><b>Response Example:</b></p>

<pre>{responseExample}</pre>

        <button onClick={() => copy(responseExample,"response")}>
          {copied==="response" ? "Copied!" : "Copy Response"}
        </button>

      </div>


      {/* HOSTED PAYMENT PAGE */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Hosted Payment Page</h2>

        <p>Redirect your customer to this page to complete payment.</p>

        <pre>{payPage}</pre>

        <button onClick={() => copy(payPage,"pay")}>
          {copied==="pay" ? "Copied!" : "Copy URL"}
        </button>

      </div>


      {/* CHECK STATUS */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>

        <h2>Check Order Status</h2>

        <p>Use this API to verify payment status.</p>

        <pre>{statusEndpoint}</pre>

        <button onClick={() => copy(statusEndpoint,"status")}>
          {copied==="status" ? "Copied!" : "Copy Endpoint"}
        </button>

        <p style={{marginTop:"15px"}}>Method: GET</p>

        <p>Example Response:</p>

<pre>
{`{
  "order_id": "NASPRO-1730212345678-a1b2c3",
  "username": "customer123",
  "amount": 1000,
  "service": "Deposit",
  "status": "PAID"
}`}
</pre>

      </div>


      {/* CALLBACK */}
      <div style={{background:"#0f172a", color:"#fff", padding:"20px", borderRadius:"10px"}}>

        <h2>Payment Callback</h2>

        <p>After successful payment, our system sends a POST request to your callback URL.</p>

        <pre>{callbackPayload}</pre>

        <button onClick={() => copy(callbackPayload,"callback")}>
          {copied==="callback" ? "Copied!" : "Copy Payload"}
        </button>

      </div>

    </PortalLayout>
  );
  }
