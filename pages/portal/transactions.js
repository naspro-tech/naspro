import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Transactions(){

  const [orders,setOrders] = useState([]);
  const [search,setSearch] = useState("");
  const [status,setStatus] = useState("ALL");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadOrders();
  },[]);

  const loadOrders = async () => {

    try{

      const res = await fetch("/api/order/list");
      const data = await res.json();

      if(data.success){
        setOrders(data.data);
      }

    }catch(err){
      console.error(err);
    }

    setLoading(false);

  };

  const filteredOrders = orders
    .filter(order =>
      (order.order_id || "")
      .toLowerCase()
      .includes(search.toLowerCase())
    )
    .filter(order =>
      status === "ALL" ? true : order.status === status
    );

  return (

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"20px"}}>
        Transactions
      </h1>

      <div style={{display:"flex",gap:"20px",marginBottom:"20px"}}>

        <input
          type="text"
          placeholder="Search Order ID..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={{
            padding:"10px",
            width:"250px"
          }}
        />

        <select
          value={status}
          onChange={(e)=>setStatus(e.target.value)}
          style={{
            padding:"10px"
          }}
        >
          <option value="ALL">All</option>
          <option value="PAID">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>

      </div>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        borderRadius:"10px",
        padding:"20px"
      }}>

        {loading ? (

          <p>Loading transactions...</p>

        ) : (

          <table style={{
            width:"100%",
            borderCollapse:"collapse"
          }}>

            <thead>

              <tr>

                <th>Order ID</th>
                <th>Username</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign:"center",padding:"20px"}}>
                    No transactions found
                  </td>
                </tr>
              )}

              {filteredOrders.map(order=>(
                <tr key={order.order_id} style={{textAlign:"center"}}>

                  <td>{order.order_id}</td>

                  <td>{order.username}</td>

                  <td>PKR {order.amount}</td>

                  <td>

                    {order.status === "PAID" && (
                      <span style={{color:"#22c55e"}}>
                        PAID
                      </span>
                    )}

                    {order.status === "PENDING" && (
                      <span style={{color:"#facc15"}}>
                        PENDING
                      </span>
                    )}

                    {order.status === "FAILED" && (
                      <span style={{color:"#ef4444"}}>
                        FAILED
                      </span>
                    )}

                  </td>

                  <td>
                    {new Date(order.created_at).toLocaleString()}
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
