import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {

  const [stats, setStats] = useState({
    totalBalance: 0,
    settledAmount: 0,
    pendingWithdraws: 0,
    usdtRequests: 0
  });

  useEffect(() => {

    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats");
        const data = await res.json();

        if (data.success) {
          setStats(data);
        }

      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    loadStats();

  }, []);

  return (
    <AdminLayout>

      <h1 style={{fontSize:"28px", marginBottom:"25px"}}>
        Admin Dashboard
      </h1>

      <div style={{
        display:"flex",
        gap:"20px",
        flexWrap:"wrap"
      }}>

        <Card title="Total Balance" value={stats.totalBalance} />
        <Card title="Total Settled Amount" value={stats.settledAmount} />
        <Card title="Pending Withdraws" value={stats.pendingWithdraws} />
        <Card title="USDT Requests" value={stats.usdtRequests} />

      </div>

    </AdminLayout>
  );
}

function Card({title,value}) {

  return (
    <div style={{
      background:"#0f172a",
      color:"#fff",
      padding:"20px",
      borderRadius:"10px",
      width:"220px"
    }}>

      <h3 style={{marginBottom:"10px"}}>{title}</h3>

      <p style={{
        fontSize:"22px",
        fontWeight:"bold"
      }}>
        {value}
      </p>

    </div>
  );

}
