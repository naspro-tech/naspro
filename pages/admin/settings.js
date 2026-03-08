import AdminLayout from "../../components/AdminLayout";

export default function AdminSettings() {

  return (
    <AdminLayout>

      <h1 style={{ fontSize:"26px", marginBottom:"20px" }}>
        Admin Settings
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff", 
        padding:"25px",
        borderRadius:"10px",
        maxWidth:"500px"
      }}>

        <h3 style={{ marginBottom:"15px" }}>
          System Configuration
        </h3>

        <div style={{ marginBottom:"15px" }}>
          <label>Platform Fee (%)</label>
          <br/>
          <input
            type="number"
            placeholder="Enter fee percentage"
            style={{ width:"100%", padding:"8px", marginTop:"5px" }}
          />
        </div>

        <div style={{ marginBottom:"15px" }}>
          <label>Minimum Withdraw Amount</label>
          <br/>
          <input
            type="number"
            placeholder="Enter minimum withdraw"
            style={{ width:"100%", padding:"8px", marginTop:"5px" }}
          />
        </div>

        <div style={{ marginBottom:"15px" }}>
          <label>USDT Wallet (Admin)</label>
          <br/>
          <input
            type="text"
            placeholder="Enter admin USDT wallet"
            style={{ width:"100%", padding:"8px", marginTop:"5px" }}
          />
        </div>

        <button style={{
          marginTop:"10px",
          padding:"10px 20px",
          background:"#2563eb",
          color:"#fff",
          border:"none",
          borderRadius:"5px",
          cursor:"pointer"
        }}>
          Save Settings
        </button>

      </div>

    </AdminLayout>
  );
            }
