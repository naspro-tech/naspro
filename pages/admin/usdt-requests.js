import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function UsdtRequests() {

  const [requests,setRequests] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadRequests();
  },[]);

  const loadRequests = async () => {

    try{

      const res = await fetch("/api/usdt/history");
      const data = await res.json();

      if(data.success){
        setRequests(data.data);
      }

    }catch(err){
      console.error(err);
    }

    setLoading(false);

  };


  const approveRequest = async (id) => {

    const proof1 = prompt("Paste Proof 1 URL (Send Screenshot)");
    if(!proof1) return;

    const proof2 = prompt("Paste Proof 2 URL (Blockchain Screenshot)");
    if(!proof2) return;

    try{

      const res = await fetch("/api/admin/usdt/approve",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          id,
          proof_1:proof1,
          proof_2:proof2
        })
      });

      const data = await res.json();

      if(data.success){
        alert("Request Approved");
        loadRequests();
      }

    }catch(err){
      alert("Server error");
    }

  };


  const rejectRequest = async (id) => {

    if(!confirm("Reject this request?")) return;

    try{

      const res = await fetch("/api/admin/usdt/reject",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({id})
      });

      const data = await res.json();

      if(data.success){
        alert("Request Rejected");
        loadRequests();
      }

    }catch(err){
      alert("Server error");
    }

  };


  return (

    <AdminLayout>

      <h1 style={{fontSize:"26px",marginBottom:"20px"}}>
        USDT Settlement Requests
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        padding:"20px",
        borderRadius:"10px"
      }}>

        {loading ? (

          <p>Loading requests...</p>

        ) : (

          <table style={{width:"100%",borderCollapse:"collapse"}}>

            <thead>

              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Wallet</th>
                <th>Status</th>
                <th>Proof 1</th>
                <th>Proof 2</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {requests.map((r)=>(
                <tr key={r.id} style={{textAlign:"center"}}>

                  <td>{r.id}</td>

                  <td>{r.amount}</td>

                  <td>{r.wallet}</td>

                  <td>

                    {r.status === "PENDING" && (
                      <span style={{color:"#facc15"}}>PENDING</span>
                    )}

                    {r.status === "APPROVED" && (
                      <span style={{color:"#22c55e"}}>APPROVED</span>
                    )}

                    {r.status === "REJECTED" && (
                      <span style={{color:"#ef4444"}}>REJECTED</span>
                    )}

                  </td>

                  <td>

                    {r.proof_1 ? (
                      <a href={r.proof_1} target="_blank">View</a>
                    ) : (
                      "-"
                    )}

                  </td>

                  <td>

                    {r.proof_2 ? (
                      <a href={r.proof_2} target="_blank">View</a>
                    ) : (
                      "-"
                    )}

                  </td>

                  <td>

                    {r.status === "PENDING" && (
                      <>
                        <button
                          onClick={()=>approveRequest(r.id)}
                          style={{marginRight:"10px"}}
                        >
                          Approve
                        </button>

                        <button
                          onClick={()=>rejectRequest(r.id)}
                        >
                          Reject
                        </button>
                      </>
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
