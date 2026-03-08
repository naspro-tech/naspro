import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {

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

        <div style={{
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          width:"200px"
        }}>
          <h3>Total Merchants</h3>
          <p>0</p>
        </div>

        <div style={{
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          width:"200px"
        }}>
          <h3>Total Transactions</h3>
          <p>0</p>
        </div>

        <div style={{
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          width:"200px"
        }}>
          <h3>Pending Withdrawals</h3>
          <p>0</p>
        </div>

        <div style={{
          background:"#0f172a",
          padding:"20px",
          borderRadius:"10px",
          width:"200px"
        }}>
          <h3>USDT Requests</h3>
          <p>0</p>
        </div>

      </div>

    </AdminLayout>
  );
}
