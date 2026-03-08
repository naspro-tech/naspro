import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function UsdtHistory() {

  const [requests,setRequests] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadHistory();
  },[]);

  const loadHistory = async () => {

    try{

      const res = await fetch("/api/usdt/history");

      const data = await res.json();

      if(data.success){
        setRequests(data.data);
      }

    }catch(err){
      console.error("History load error",err);
    }

    setLoading(false);

  };

  return (

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        USDT Request History
      </h1>

      <div style={{
        background:"#0f172a",
        padding:"20px",
        borderRadius:"10px",
        color:"#fff"
      }}>

        {loading ? (

          <p>Loading history...</p>

        ) : (

          <table style={{
            width:"100%",
            borderCollapse:"collapse"
          }}>

            <thead>

              <tr style={{borderBottom:"1px solid #333"}}>

                <th style={{padding:"10px"}}>Amount</th>
                <th style={{padding:"10px"}}>Wallet</th>
                <th style={{padding:"10px"}}>Status</th>
                <th style={{padding:"10px"}}>Proof</th>
                <th style={{padding:"10px"}}>Date</th>

              </tr>

            </thead>

            <tbody>

              {requests.length === 0 && (
                <tr>
                  <td colSpan="5" style={{padding:"20px",textAlign:"center"}}>
                    No requests yet
                  </td>
                </tr>
              )}

              {requests.map((r)=>(
                <tr key={r.id} style={{textAlign:"center",borderBottom:"1px solid #1e293b"}}>

                  <td style={{padding:"10px"}}>
                    {r.amount}
                  </td>

                  <td style={{padding:"10px"}}>
                    {r.wallet}
                  </td>

                  <td style={{padding:"10px"}}>

                    {r.status === "PENDING" && (
                      <span style={{color:"#facc15"}}>
                        PENDING
                      </span>
                    )}

                    {r.status === "APPROVED" && (
                      <span style={{color:"#22c55e"}}>
                        APPROVED
                      </span>
                    )}

                  </td>

                  <td style={{padding:"10px"}}>

                    {r.proof_1 ? (

                      <a
                        href={r.proof_1}
                        target="_blank"
                        style={{color:"#38bdf8"}}
                      >
                        View Proof
                      </a>

                    ) : (

                      "Pending"

                    )}

                  </td>

                  <td style={{padding:"10px"}}>
                    {new Date(r.created_at).toLocaleString()}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        )}

      </div>

    </PortalLayout>

  );

          }
