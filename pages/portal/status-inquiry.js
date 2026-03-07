import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function StatusInquiry() {

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);

  const checkStatus = async () => {

    const res = await fetch(`/api/order/get?orderId=${orderId}`);
    const data = await res.json();

    setOrder(data);

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"20px"}}>
        Status Inquiry
      </h1>

      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{padding:"10px", marginRight:"10px"}}
      />

      <button onClick={checkStatus}>
        Check
      </button>

      {order && (
        <div style={{marginTop:"20px", background:"#111", padding:"20px"}}>
          <p><b>Order ID:</b> {order.order_id}</p>
          <p><b>Username:</b> {order.username}</p>
          <p><b>Amount:</b> PKR {order.amount}</p>
          <p><b>Status:</b> {order.status}</p>
        </div>
      )}

    </PortalLayout>
  );
               }
