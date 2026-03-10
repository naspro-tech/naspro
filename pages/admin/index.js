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

        // 1️⃣ Wallet Balance
        const walletRes = await fetch("/api/wallet/balance");
        const walletData = await walletRes.json();

        let balance = 0;
        let settled = 0;

        if (walletData.success) {

          balance = walletData.balance;

          // same formula used in merchant portal
          const fee = balance * 0.00986;
          settled = balance - fee;

        }

        // 2️⃣ Withdraw Requests
        const withdrawRes = await fetch("/api/withdraw/request");
        const withdrawData = await withdrawRes.json();

        const withdrawCount = withdrawData.success
          ? withdrawData.requests.length
          : 0;

        // 3️⃣ USDT Requests
        const usdtRes = await fetch("/api/usdt/request");
        const usdtData = await usdtRes.json();

        const usdtCount = usdtData.success
          ? usdtData.requests.length
          : 0;

        setStats({
          totalBalance: balance,
          settledAmount: settled,
          pendingWithdraws: withdrawCount,
          usdtRequests: usdtCount
        });

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
