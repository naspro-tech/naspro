import AdminLayout from "../../components/AdminLayout";

export default function UsdtRequests() {

  const requests = [
    {
      id: "USDT1001",
      merchant: "Test Merchant",
      amount: "200000 PKR",
      wallet: "TRC20 - TXabc123wallet",
      status: "Pending"
    },
    {
      id: "USDT1002",
      merchant: "Demo Store",
      amount: "50000 PKR",
      wallet: "TRC20 - TXxyz987wallet",
      status: "Pending"
    }
  ];

  return (
    <AdminLayout>

      <h1 style={{ fontSize:"26px", marginBottom:"20px" }}>
        USDT Settlement Requests
      </h1>

      <table style={{
        width:"100%",
        background:"#0f172a",
        color:"#fff", 
        borderRadius:"10px",
        padding:"15px"
      }}>

        <thead>
          <tr>
            <th>ID</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Wallet</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.merchant}</td>
              <td>{r.amount}</td>
              <td>{r.wallet}</td>
              <td>{r.status}</td>
              <td>
                <button style={{marginRight:"10px"}}>Approve</button>
                <button>Reject</button>
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </AdminLayout>
  );
          }
