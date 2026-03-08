import { useEffect, useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Wallet() {

  const [settled, setSettled] = useState(0);

  useEffect(() => {

    const loadBalance = async () => {
      const res = await fetch("/api/wallet/balance");
      const data = await res.json();

      const gross = data.balance || 0;

      const fee = gross * 0.00986; // Easypaisa 0.986%
      const settledAmount = gross - fee;

      setSettled(settledAmount);
    };

    loadBalance();

  }, []);

  return (
    <PortalLayout>

      <h1>Wallet</h1>

      <div style={{
        padding: "20px",
        color:"#fff",
        background:"#0f172a",
        borderRadius:"10px",
        marginTop:"20px"
      }}>
        <h2>Settled Amount</h2>
        <h1>PKR {settled.toFixed(2)}</h1>
      </div>

    </PortalLayout>
  );
}
