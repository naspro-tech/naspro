import PortalLayout from "../../components/PortalLayout";

export default function PortalDashboard() {
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

        <div style={{background:"#111",padding:"20px",borderRadius:"10px"}}>
          <h3>Total Balance</h3>
          <p>$0.00</p>
        </div>

        <div style={{background:"#111",padding:"20px",borderRadius:"10px"}}>
          <h3>Today's Payments</h3>
          <p>0</p>
        </div>

        <div style={{background:"#111",padding:"20px",borderRadius:"10px"}}>
          <h3>Total Orders</h3>
          <p>0</p>
        </div>

      </div>

    </PortalLayout>
  );
}
