import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Withdraw() {

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");

  const submitWithdraw = async () => {

    const res = await fetch("/api/withdraw/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        amount,
        method,
        bank_name: bankName,
        account
      })
    });

    const data = await res.json();

    if(data.success){
      setMessage("Withdraw request submitted.");
      setUserId("");
      setAmount("");
      setMethod("");
      setBankName("");
      setAccount("");
    } else {
      setMessage(data.message || "Error submitting request.");
    }

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"30px"}}>
        Withdraw (Pay User)
      </h1>

      <div style={{
        background:"#111",
        padding:"30px",
        borderRadius:"10px",
        maxWidth:"500px"
      }}>

        <p>User ID</p>
        <input
          type="text"
          value={userId}
          onChange={(e)=>setUserId(e.target.value)}
          style={{width:"100%", color:"#fff", padding:"10px", marginBottom:"20px"}}
        />

        <p>Amount (PKR)</p>
        <input
          type="number"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          style={{width:"100%", color:"#fff", padding:"10px", marginBottom:"20px"}}
        />

        <p>Withdraw Method</p>
        <select
          value={method}
          onChange={(e)=>setMethod(e.target.value)}
          style={{width:"100%", color:"#fff", padding:"10px", marginBottom:"20px"}}
        >
          <option value="">Select Method</option>
          <option value="bank">Bank Transfer</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">Easypaisa</option>
        </select>

        {method === "bank" && (
          <>
            <p>Bank Name</p>
            <input
              type="text"
              value={bankName}
              onChange={(e)=>setBankName(e.target.value)}
              style={{width:"100%", color:"#fff", padding:"10px", marginBottom:"20px"}}
            />
          </>
        )}

        <p>Account / Number</p>
        <input
          type="text"
          value={account}
          onChange={(e)=>setAccount(e.target.value)}
          style={{width:"100%", color:"#fff", padding:"10px", marginBottom:"20px"}}
        />

        <button
          onClick={submitWithdraw}
          style={{
            padding:"10px 20px",
            background:"#22c55e",
            border:"none",
            cursor:"pointer"
          }}
        >
          Submit Withdraw
        </button>

        <p style={{marginTop:"20px"}}>{message}</p>

      </div>

    </PortalLayout>
  );
                  }
