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
  const manualInquiry = `${domain}/inquire-easypay`;

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

      <div style={{background:"#020617", color:"#fff", padding:"20px", marginBottom:"25px", borderRadius:"10px"}}>
        <h2>Integration Overview</h2>

        <p>
        This payment gateway allows merchants to accept Easypaisa payments using a hosted payment page.
        The integration process is simple and requires only a few steps.
        </p>

        <p><b>Complete Payment Flow:</b></p>

        <ol style={{lineHeight:"1.8"}}>
          <li>Merchant backend sends POST request to Create Payment API.</li>
          <li>System generates Order ID and returns redirect_url.</li>
          <li>Merchant redirects customer to hosted payment page.</li>
          <li>Customer approves payment inside Easypaisa mobile app.</li>
          <li>Gateway sends callback to merchant server.</li>
          <li>Merchant updates transaction or user balance.</li>
          <li>Status can also be verified using status API.</li>
        </ol>

        <p>
        Every API request must include <b>x-api-key</b> header provided to the merchant.
        </p>
      </div>

      {/* CREATE PAYMENT */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Create Payment</h2>

        <p><b>Endpoint</b></p>
        <pre>{createEndpoint}</pre>

        <button onClick={() => copy(createEndpoint,"endpoint")}>
          {copied==="endpoint" ? "Copied!" : "Copy Endpoint"}
        </button>

        <p style={{marginTop:"15px"}}><b>Method:</b> POST</p>

        <p><b>Headers</b></p>

<pre>
Content-Type: application/json
x-api-key: YOUR_API_KEY
</pre>

        <p><b>Request Body</b></p>

        <pre>{requestBody}</pre>

        <button onClick={() => copy(requestBody,"body")}>
          {copied==="body" ? "Copied!" : "Copy Body"}
        </button>

        <p style={{marginTop:"20px"}}><b>Response Example</b></p>

        <pre>{responseExample}</pre>

        <button onClick={() => copy(responseExample,"response")}>
          {copied==="response" ? "Copied!" : "Copy Response"}
        </button>
      </div>


      {/* HOSTED PAYMENT PAGE */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Hosted Payment Page</h2>

        <p>Redirect customer to this page:</p>

        <pre>{payPage}</pre>

        <button onClick={() => copy(payPage,"pay")}>
          {copied==="pay" ? "Copied!" : "Copy URL"}
        </button>

        <p style={{marginTop:"10px"}}>
        Customer approves payment inside Easypaisa app under My Approvals.
        </p>
      </div>


      {/* STATUS API */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Check Order Status (API)</h2>

        <pre>{statusEndpoint}</pre>

        <button onClick={() => copy(statusEndpoint,"status")}>
          {copied==="status" ? "Copied!" : "Copy Endpoint"}
        </button>

<pre style={{marginTop:"15px"}}>
{`{
  "order_id": "NASPRO-1730212345678-a1b2c3",
  "username": "customer123",
  "amount": 1000,
  "service": "Deposit",
  "status": "PAID"
}`}
</pre>

        <p>Possible status values: PENDING, PAID, FAILED</p>
      </div>


      {/* MANUAL INQUIRY */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Manual Status Inquiry</h2>

        <pre>{manualInquiry}</pre>

        <button onClick={() => copy(manualInquiry,"manual")}>
          {copied==="manual" ? "Copied!" : "Copy URL"}
        </button>

        <p style={{marginTop:"10px"}}>
        Merchant support team can check payment status manually using this tool.
        </p>
      </div>


      {/* CALLBACK */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", borderRadius:"10px"}}>
        <h2>Payment Callback</h2>

        <p>After successful payment our system sends POST request to your callback URL.</p>

        <pre>{callbackPayload}</pre>

        <button onClick={() => copy(callbackPayload,"callback")}>
          {copied==="callback" ? "Copied!" : "Copy Payload"}
        </button>

      </div>

    </PortalLayout>
  );
          }
