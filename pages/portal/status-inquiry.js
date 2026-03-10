import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function StatusInquiry(){

  const [orderId,setOrderId] = useState("");
  const [order,setOrder] = useState(null);
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);

  const checkStatus = async () => {

    if(!orderId){
      setMessage("Please enter Order ID");
      return;
    }

    try{

      setLoading(true);
      setMessage("");
      setOrder(null);

      const res = await fetch(`/api/order/get?orderId=${orderId}`);

      const data = await res.json();

      if(res.ok){
        setOrder(data);
      }else{
        setMessage(data.message || "Order not found");
      }

    }catch(err){
      setMessage("Server error");
    }

    setLoading(false);

  };

  return(

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"20px"}}>
        Status Inquiry
      </h1>

      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e)=>setOrderId(e.target.value)}
        style={{padding:"10px",marginRight:"10px"}}
      />

      <button
        onClick={checkStatus}
        style={{padding:"10px 20px"}}
      >
        {loading ? "Checking..." : "Check"}
      </button>

      {message && (
        <p style={{marginTop:"20px",color:"red"}}>
          {message}
        </p>
      )}

      {order && (

        <div style={{
          marginTop:"20px",
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          color:"#fff"
        }}>

          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Username:</b> {order.username}</p>
          <p><b>Amount:</b> PKR {order.amount}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>

        </div>

      )}

    </PortalLayout>

  );

          }
