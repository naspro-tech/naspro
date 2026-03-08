import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function PortalDashboard() {

  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState([]);
  const [todayPayments, setTodayPayments] = useState(0);

  useEffect(() => {

    const loadBalance = async () => {
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();
      setBalance(data.balance || 0);
    };

    const loadOrders = async () => {
  const res = await fetch("/api/order/list");
  const data = await res.json();

  const orderList = Array.isArray(data) ? data : [];
  setOrders(orderList);

  const today = new Date().toISOString().split("T")[0];

  const totalToday = orderList
    .filter(o => o.created_at?.startsWith(today) && o.status === "PAID")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  setTodayPayments(totalToday);
};

    loadBalance();
    loadOrders();

  }, []);

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"20px"}}>
        Merchant Dashboard
      </h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",
        gap:"20px"
      }}>

        <div style={{background: "#0f172a",color:"#fff",padding:"20px",borderRadius:"10px"}}>
          <h3>Total Balance</h3>
          <p>PKR {balance}</p>
        </div>

        <div style={{background:"#0f172a",color:"#fff",padding:"20px",borderRadius:"10px"}}>
          <h3>Today's Payments</h3>
          <p>PKR {todayPayments}</p>
        </div>

        <div style={{background:"#0f172a",color:"#fff",padding:"20px",borderRadius:"10px"}}>
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>

      </div>

    </PortalLayout>
  );
}
