import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function Commission() {

  const [balance, setBalance] = useState(0);

  const [depositCommission, setDepositCommission] = useState(0);

  const [usdtAmount, setUsdtAmount] = useState(0);
  const [usdtCommission, setUsdtCommission] = useState(0);

  const [deduct, setDeduct] = useState(0);

  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {

    loadBalance();
    loadCommission();

  }, []);

  const loadBalance = async () => {

    try {

      const res = await fetch("/api/wallet/balance");
      const data = await res.json();

      if (data.success) {

        const totalBalance = data.balance;

        const commission = totalBalance * 0.04;

        setBalance(totalBalance);
        setDepositCommission(commission);

        calculateTotal(commission, usdtCommission, deduct);

      }

    } catch (err) {

      console.error(err);

    }

  };

  const loadCommission = async () => {

    const res = await fetch("/api/admin/commission");
    const data = await res.json();

    if (data.success) {

      setUsdtAmount(data.usdt_amount);
      setDeduct(data.deduct_amount);

      const usdtFee = data.usdt_amount * 4;

      setUsdtCommission(usdtFee);

      calculateTotal(depositCommission, usdtFee, data.deduct_amount);

    }

  };

  const saveCommission = async (usdt, deductAmount) => {

    await fetch("/api/admin/commission",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        usdt_amount: usdt,
        deduct_amount: deductAmount
      })
    });

  };

  const calculateUSDT = (value) => {

    const amount = Number(value);

    setUsdtAmount(amount);

    const fee = amount * 4;

    setUsdtCommission(fee);

    calculateTotal(depositCommission, fee, deduct);

    saveCommission(amount, deduct);

  };

  const calculateDeduct = (value) => {

    const amount = Number(value);

    setDeduct(amount);

    calculateTotal(depositCommission, usdtCommission, amount);

    saveCommission(usdtAmount, amount);

  };

  const calculateTotal = (deposit, usdt, minus) => {

    const total = deposit + usdt - minus;

    setTotalCommission(total);

  };

  return (

    <AdminLayout>

      <h1 style={{fontSize:"26px", marginBottom:"25px"}}>
        Commission
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        padding:"25px",
        borderRadius:"10px",
        maxWidth:"500px"
      }}>

        <p><b>Total Balance:</b> {balance} PKR</p>

        <p><b>Deposit Commission (4%):</b> {depositCommission.toFixed(2)} PKR</p>

        <hr style={{margin:"15px 0"}} />

        <div style={{marginBottom:"15px"}}>

          <label>USDT Sent</label>

          <input
            type="number"
            value={usdtAmount}
            onChange={(e)=>calculateUSDT(e.target.value)}
            style={{
              width:"100%",
              padding:"8px",
              marginTop:"5px"
            }}
          />

        </div>

        <p><b>USDT Commission:</b> {usdtCommission} PKR</p>

        <hr style={{margin:"15px 0"}} />

        <div style={{marginBottom:"15px"}}>

          <label>Commission Deduct (Client Payment)</label>

          <input
            type="number"
            value={deduct}
            onChange={(e)=>calculateDeduct(e.target.value)}
            style={{
              width:"100%",
              padding:"8px",
              marginTop:"5px"
            }}
          />

        </div>

        <hr style={{margin:"15px 0"}} />

        <h3>Total Commission: {totalCommission.toFixed(2)} PKR</h3>

      </div>

    </AdminLayout>

  );

    }
