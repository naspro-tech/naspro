import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function Transactions() {

  const [orders,setOrders] = useState([]);
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

  return (

    <AdminLayout>

      <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>
        Transactions
      </h1>

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

              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign:"center",padding:"20px"}}>
                    No transactions found
                  </td>
                </tr>
              )}

              {orders.map(order=>(
                <tr key={order.order_id} style={{textAlign:"center"}}>

                  <td>{order.order_id}</td>

                  <td>{order.username}</td>

                  <td>PKR {order.amount}</td>

                  <td>

                    {order.status === "PAID" && (
                      <span style={{color:"#22c55e"}}>PAID</span>
                    )}

                    {order.status === "PENDING" && (
                      <span style={{color:"#facc15"}}>PENDING</span>
                    )}

                    {order.status === "FAILED" && (
                      <span style={{color:"#ef4444"}}>FAILED</span>
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

    </AdminLayout>

  );

                }
