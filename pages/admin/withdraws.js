import AdminLayout from "../../components/AdminLayout";

export default function Withdraws() {

  const withdraws = [
    {
      id: "WD1001",
      merchant: "Test Merchant",
      amount: "5000 PKR",
      method: "Bank Transfer",
      account: "Habib Bank - 12345678",
      status: "Pending"
    },
    {
      id: "WD1002",
      merchant: "Demo Store",
      amount: "2000 PKR",
      method: "Easypaisa",
      account: "03001234567",
      status: "Pending"
    }
  ];

  return (
    <AdminLayout>

      <h1 style={{ fontSize:"26px", marginBottom:"20px" }}>
        Withdraw Requests
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
            <th>Method</th>
            <th>Account</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {withdraws.map((w) => (
            <tr key={w.id}>
              <td>{w.id}</td>
              <td>{w.merchant}</td>
              <td>{w.amount}</td>
              <td>{w.method}</td>
              <td>{w.account}</td>
              <td>{w.status}</td>
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
