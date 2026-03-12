import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Links() {

  const domain = "https://naspropvt.vercel.app";
  const [copied,setCopied] = useState("");

  const copy = (text,id)=>{
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(()=>setCopied(""),2000);
  };

  // DOWNLOAD MARKDOWN DOCS (PROFESSIONAL)
  const downloadDocs = () => {

    const doc = `# NASPRO Payment Gateway API

## Base URL
${domain}

---

## Authentication

All API requests must include header:

x-api-key: YOUR_API_KEY

---

## Create Payment

POST ${domain}/api/easypay/create-payment

### Request Body

{
 "amount":1000,
 "username":"customer123",
 "service":"Deposit",
 "callback":"https://merchant-site.com/api/payment-callback"
}

---

## Hosted Payment Page

${domain}/pay?orderId=NASPRO-XXXX

Redirect your customer to this page to approve payment inside Easypaisa.

---

## Status API

GET ${domain}/api/order/get?orderId=NASPRO-XXXX

### Response

{
 "order_id":"NASPRO-XXXX",
 "amount":1000,
 "status":"PAID"
}

---

## Wallet Balance API

GET ${domain}/api/wallet/balance

### Response

{
 "success":true,
 "balance":250000
}

---

## Callback Example

{
 "status":"SUCCESS",
 "order_id":"NASPRO-XXXX",
 "amount":1000,
 "gateway":"Easypaisa"
}

`;

    const blob = new Blob([doc],{type:"text/markdown"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "naspro-api-docs.md";
    a.click();
  };

  // POSTMAN COLLECTION
  const downloadPostman = () => {

    const postman = {
      info:{
        name:"NASPRO Payment Gateway",
        schema:"https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item:[
        {
          name:"Create Payment",
          request:{
            method:"POST",
            url:`${domain}/api/easypay/create-payment`
          }
        },
        {
          name:"Check Status",
          request:{
            method:"GET",
            url:`${domain}/api/order/get?orderId=NASPRO-XXXX`
          }
        },
        {
          name:"Wallet Balance",
          request:{
            method:"GET",
            url:`${domain}/api/wallet/balance`
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(postman,null,2)],{type:"application/json"});
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

  return (

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"20px"}}>
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
          marginRight:"10px",
          cursor:"pointer"
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


      {/* INTEGRATION OVERVIEW */}

      <div style={{
        background:"#020617",
        color:"#fff",
        padding:"20px",
        marginTop:"25px",
        marginBottom:"25px",
        borderRadius:"10px"
      }}>

        <h2>Integration Overview</h2>

        <p>
        This payment gateway allows merchants to accept Easypaisa payments using a hosted payment page.
        </p>

        <ol style={{lineHeight:"1.8"}}>
          <li>Merchant sends POST request to Create Payment API</li>
          <li>Gateway generates Order ID</li>
          <li>Customer redirected to hosted payment page</li>
          <li>Customer approves payment inside Easypaisa</li>
          <li>Gateway sends callback to merchant server</li>
          <li>Merchant updates user balance</li>
          <li>Status can be verified using Status API</li>
        </ol>

      </div>


      {/* CREATE PAYMENT */}

      <div style={{background:"#0f172a",color:"#fff",padding:"20px",marginBottom:"20px",borderRadius:"10px"}}>

        <h2>Create Payment API</h2>

        <pre>{createEndpoint}</pre>

        <button onClick={()=>copy(createEndpoint,"endpoint")}>
          {copied==="endpoint"?"Copied!":"Copy Endpoint"}
        </button>

      </div>


      {/* HOSTED PAGE */}

      <div style={{background:"#0f172a",color:"#fff",padding:"20px",marginBottom:"20px",borderRadius:"10px"}}>

        <h2>Hosted Payment Page</h2>

        <pre>{payPage}</pre>

        <button onClick={()=>copy(payPage,"pay")}>
          {copied==="pay"?"Copied!":"Copy URL"}
        </button>

      </div>


      {/* STATUS API */}

      <div style={{background:"#0f172a",color:"#fff",padding:"20px",marginBottom:"20px",borderRadius:"10px"}}>

        <h2>Status API</h2>

        <pre>{statusEndpoint}</pre>

        <button onClick={()=>copy(statusEndpoint,"status")}>
          {copied==="status"?"Copied!":"Copy Endpoint"}
        </button>

      </div>


      {/* WALLET BALANCE */}

      <div style={{background:"#0f172a",color:"#fff",padding:"20px",borderRadius:"10px"}}>

        <h2>Wallet Balance API</h2>

        <pre>{balanceEndpoint}</pre>

        <button onClick={()=>copy(balanceEndpoint,"balance")}>
          {copied==="balance"?"Copied!":"Copy Endpoint"}
        </button>

      </div>

    </PortalLayout>
  );
}
