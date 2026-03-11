import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function Withdraws() {

  const [withdraws,setWithdraws] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadWithdraws();
  },[]);

  const loadWithdraws = async () => {

    try{

      const res = await fetch("/api/withdraw/history");
      const data = await res.json();

      if(data.success){
        setWithdraws(data.data);
      }

    }catch(err){
      console.error(err);
    }

    setLoading(false);

  };


  const approveWithdraw = async (id) => {

    const txn = prompt("Enter Transaction ID");
    if(!txn) return;

    const proof = prompt("Paste Screenshot Proof URL");
    if(!proof) return;

    try{

      const res = await fetch("/api/admin/withdraw/approve",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          id,
          txn_id:txn,
          proof
        })
      });

      const data = await res.json();

      if(data.success){
        alert("Withdraw Approved");
        loadWithdraws();
      }

    }catch(err){
      alert("Server error");
    }

  };


  const rejectWithdraw = async (id) => {

    if(!confirm("Reject this withdraw request?")) return;

    try{

      const res = await fetch("/api/admin/withdraw/reject",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({ id })
      });

      const data = await res.json();

      if(data.success){
        alert("Withdraw Rejected");
        loadWithdraws();
      }

    }catch(err){
      alert("Server error");
    }

  };


  return (

    <AdminLayout>

      <h1 style={{fontSize:"26px",marginBottom:"20px"}}>
        Withdraw Requests
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        borderRadius:"10px",
        padding:"20px"
      }}>

        {loading ? (

          <p>Loading withdraw requests...</p>

        ) : (

          <table style={{
            width:"100%",
            borderCollapse:"collapse"
          }}>

            <thead>

              <tr>
                <th>Player</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Account</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {withdraws.length === 0 && (
                <tr>
                  <td colSpan="6" style={{textAlign:"center",padding:"20px"}}>
                    No withdraw requests
                  </td>
                </tr>
              )}

              {withdraws.map((w)=>(
                <tr key={w.id} style={{textAlign:"center"}}>

                  <td>{w.player_username}</td>

                  <td>{w.amount}</td>

                  <td>{w.method}</td>

                  <td>{w.account}</td>

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

                    {w.status === "REJECTED" && (
                      <span style={{color:"#ef4444"}}>
                        REJECTED
                      </span>
                    )}

                  </td>

                  <td>

                    {w.status === "PENDING" && (
                      <>
                        <button
                          onClick={()=>approveWithdraw(w.id)}
                          style={{marginRight:"10px"}}
                        >
                          Approve
                        </button>

                        <button
                          onClick={()=>rejectWithdraw(w.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {w.status !== "PENDING" && (
                      "-"
                    )}

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        )}

      </div>

    </AdminLayout>

  );

}
