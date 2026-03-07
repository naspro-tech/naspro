import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Transactions() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const loadOrders = async () => {

      const res = await fetch("/api/orders/list");
      const data = await res.json();

      setOrders(data);

    };

    loadOrders();

  }, []);

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"20px"}}>
        Transactions
      </h1>

      <table style={{width:"100%", background:"#111", borderRadius:"10px"}}>
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
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{order.username}</td>
              <td>PKR {order.amount}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </PortalLayout>
  );
                       }
