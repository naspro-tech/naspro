import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function UsdtRequest() {

  const [amount,setAmount] = useState("");
  const [wallet,setWallet] = useState("");
  const [message,setMessage] = useState("");

  const submitRequest = async () => {

    setMessage("Submitting request...");

    const res = await fetch("/api/usdt/request",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        amount,
        wallet
      })
    });

    const data = await res.json();

    if(data.success){
      setMessage("Request submitted. Status: Processing.");
      setAmount("");
      setWallet("");
    }else{
      setMessage(data.message || "Request failed");
    }

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        USDT Request
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        padding:"30px",
        borderRadius:"10px",
        maxWidth:"500px"
      }}>

        <p>Amount (PKR)</p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px"
          }}
        />

        <p>USDT Wallet (TRC20)</p>

        <input
          type="text"
          placeholder="Enter TRC20 wallet address"
          value={wallet}
          onChange={(e)=>setWallet(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px"
          }}
        />

        <button
          onClick={submitRequest}
          style={{
            padding:"10px 20px",
            background:"#22c55e",
            color:"#fff",
            border:"none",
            cursor:"pointer"
          }}
        >
          Submit Request
        </button>

        <p style={{marginTop:"20px"}}>
          {message}
        </p>

      </div>

    </PortalLayout>
  );
          }
