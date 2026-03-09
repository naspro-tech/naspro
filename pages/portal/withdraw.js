import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Withdraw() {

  const [player,setPlayer] = useState("");
  const [amount,setAmount] = useState("");
  const [method,setMethod] = useState("");
  const [bankName,setBankName] = useState("");
  const [account,setAccount] = useState("");
  const [message,setMessage] = useState("");
  const [history,setHistory] = useState([]);

  useEffect(()=>{
    loadHistory();
  },[]);

  const loadHistory = async () => {

    try{

      const res = await fetch("/api/withdraw/history");
      const data = await res.json();

      if(data.success){
        setHistory(data.data);
      }

    }catch(err){
      console.error(err);
    }

  };

  const submitWithdraw = async () => {

    if(!player || !amount || !method || !account){
      setMessage("Please fill all required fields.");
      return;
    }

    if(Number(amount) <= 0){
      setMessage("Invalid amount.");
      return;
    }

    setMessage("Submitting request...");

    try{

      const res = await fetch("/api/withdraw/request",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          player_username:player,
          amount,
          method,
          bank_name:bankName,
          account
        })
      });

      const data = await res.json();

      if(data.success){

        setMessage("Withdraw request submitted.");

        setPlayer("");
        setAmount("");
        setMethod("");
        setBankName("");
        setAccount("");

        loadHistory();

      }else{
        setMessage(data.message);
      }

    }catch(err){
      setMessage("Server error.");
    }

  };

  return (

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        Withdraw (Pay Player)
      </h1>

      <div style={{
        display:"flex",
        gap:"40px",
        alignItems:"flex-start"
      }}>

        {/* LEFT SIDE FORM */}

        <div style={{
          background:"#0f172a",
          color:"#fff",
          padding:"30px",
          borderRadius:"10px",
          width:"400px"
        }}>

          <p>Player Username</p>

          <input
            type="text"
            value={player}
            onChange={(e)=>setPlayer(e.target.value)}
            style={{width:"100%",padding:"10px",marginBottom:"20px"}}
          />

          <p>Amount (PKR)</p>

          <input
            type="number"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
            style={{width:"100%",padding:"10px",marginBottom:"20px"}}
          />

          <p>Withdraw Method</p>

          <select
            value={method}
            onChange={(e)=>setMethod(e.target.value)}
            style={{width:"100%",padding:"10px",marginBottom:"20px"}}
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
                style={{width:"100%",padding:"10px",marginBottom:"20px"}}
              />
            </>
          )}

          <p>Account / Number</p>

          <input
            type="text"
            value={account}
            onChange={(e)=>setAccount(e.target.value)}
            style={{width:"100%",padding:"10px",marginBottom:"20px"}}
          />

          <button
            onClick={submitWithdraw}
            style={{
              padding:"10px 20px",
              background:"#22c55e",
              border:"none",
              color:"#fff",
              cursor:"pointer"
            }}
          >
            Submit Withdraw
          </button>

          <p style={{marginTop:"20px"}}>
            {message}
          </p>

        </div>


        {/* RIGHT SIDE HISTORY */}

        <div style={{
          flex:1,
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          color:"#fff"
        }}>

          <h3 style={{marginBottom:"20px"}}>
            Withdraw History
          </h3>

          <table style={{
            width:"100%",
            borderCollapse:"collapse"
          }}>

            <thead>

              <tr>

                <th>Player</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>TXN</th>
                <th>Proof</th>

              </tr>

            </thead>

            <tbody>

              {history.length === 0 && (
                <tr>
                  <td colSpan="6" style={{padding:"20px",textAlign:"center"}}>
                    No withdraw requests yet
                  </td>
                </tr>
              )}

              {history.map((w)=>(
                <tr key={w.id} style={{textAlign:"center"}}>

                  <td>{w.player_username}</td>

                  <td>{w.amount}</td>

                  <td>{w.method}</td>

                  <td>

                    {w.status === "PENDING" && (
                      <span style={{color:"#facc15"}}>
                        PENDING
                      </span>
                    )}

                    {w.status === "APPROVED" && (
                      <span style={{color:"#22c55e"}}>
                        APPROVED
                      </span>
                    )}

                  </td>

                  <td>
                    {w.txn_id || "-"}
                  </td>

                  <td>

                    {w.proof ? (
                      <a
                        href={w.proof}
                        target="_blank"
                        style={{color:"#38bdf8"}}
                      >
                        View
                      </a>
                    ) : (
                      "Pending"
                    )}

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </PortalLayout>

  );

    }
