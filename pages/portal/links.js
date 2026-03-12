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

  // DOWNLOAD API DOCS
  const downloadDocs = () => {

    const text = `
NASPRO PAYMENT GATEWAY API DOCUMENTATION

Base URL
${domain}

Authentication
All requests must include header:
x-api-key: YOUR_API_KEY

CREATE PAYMENT
POST ${domain}/api/easypay/create-payment

STATUS API
GET ${domain}/api/order/get?orderId=NASPRO-XXXX

WALLET BALANCE
GET ${domain}/api/wallet/balance

Hosted Payment Page
${domain}/pay?orderId=NASPRO-XXXX
`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "naspro-api-docs.txt";
    a.click();
  };

  // DOWNLOAD POSTMAN COLLECTION
  const downloadPostman = () => {

    const postman = {
      info: {
        name: "NASPRO Payment Gateway",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Create Payment",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "x-api-key", value: "YOUR_API_KEY" }
            ],
            body: {
              mode: "raw",
              raw: `{
  "amount": 1000,
  "username": "customer123",
  "service": "Deposit",
  "callback": "https://merchant-site.com/api/payment-callback"
}`
            },
            url: `${domain}/api/easypay/create-payment`
          }
        },
        {
          name: "Check Status",
          request: {
            method: "GET",
            header: [
              { key: "x-api-key", value: "YOUR_API_KEY" }
            ],
            url: `${domain}/api/order/get?orderId=NASPRO-XXXX`
          }
        },
        {
          name: "Wallet Balance",
          request: {
            method: "GET",
            header: [
              { key: "x-api-key", value: "YOUR_API_KEY" }
            ],
            url: `${domain}/api/wallet/balance`
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(postman,null,2)], {
      type:"application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "naspro-postman-collection.json";
    a.click();
  };

  const createEndpoint = `${domain}/api/easypay/create-payment`;
  const payPage = `${domain}/pay?orderId=NASPRO-XXXX`;
  const statusEndpoint = `${domain}/api/order/get?orderId=NASPRO-XXXX`;
  const balanceEndpoint = `${domain}/api/wallet/balance`;
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

      <h1 style={{fontSize:"28px", marginBottom:"20px"}}>
        Payment Gateway API Documentation
      </h1>

      <button
        onClick={downloadDocs}
        style={{
          background:"#22c55e",
          border:"none",
          padding:"10px 15px",
          color:"#fff",
          borderRadius:"6px",
          cursor:"pointer",
          marginRight:"10px"
        }}
      >
        Download API Docs
      </button>

      <button
        onClick={downloadPostman}
        style={{
          background:"#2563eb",
          border:"none",
          padding:"10px 15px",
          color:"#fff",
          borderRadius:"6px",
          cursor:"pointer"
        }}
      >
        Download Postman Collection
      </button>

      {/* BASE URL */}

      <div style={{background:"#020617", color:"#fff", padding:"20px", marginTop:"25px", marginBottom:"25px", borderRadius:"10px"}}>
        <h2>Base URL</h2>

        <pre>{domain}</pre>

        <button onClick={() => copy(domain,"base")}>
          {copied==="base" ? "Copied!" : "Copy"}
        </button>

        <p style={{marginTop:"15px"}}>
          Every API request must include <b>x-api-key</b> header.
        </p>
      </div>

      {/* CREATE PAYMENT */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Create Payment</h2>

        <pre>{createEndpoint}</pre>

        <button onClick={() => copy(createEndpoint,"endpoint")}>
          {copied==="endpoint" ? "Copied!" : "Copy Endpoint"}
        </button>

<pre style={{marginTop:"10px"}}>
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
      </div>

      {/* HOSTED PAYMENT */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Hosted Payment Page</h2>

        <pre>{payPage}</pre>

        <button onClick={() => copy(payPage,"pay")}>
          {copied==="pay" ? "Copied!" : "Copy URL"}
        </button>
      </div>

      {/* STATUS API */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Check Order Status</h2>

        <pre>{statusEndpoint}</pre>

        <button onClick={() => copy(statusEndpoint,"status")}>
          {copied==="status" ? "Copied!" : "Copy Endpoint"}
        </button>
      </div>

      {/* WALLET BALANCE */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Wallet Balance API</h2>

        <pre>{balanceEndpoint}</pre>

        <button onClick={() => copy(balanceEndpoint,"balance")}>
          {copied==="balance" ? "Copied!" : "Copy Endpoint"}
        </button>
      </div>

      {/* MANUAL INQUIRY */}

      <div style={{background:"#0f172a", color:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px"}}>
        <h2>Manual Status Inquiry</h2>

        <pre>{manualInquiry}</pre>

        <button onClick={() => copy(manualInquiry,"manual")}>
          {copied==="manual" ? "Copied!" : "Copy URL"}
        </button>
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
