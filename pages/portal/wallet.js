import PortalLayout from "../../components/PortalLayout";

export default function Wallet() {
  return (
    <PortalLayout>

      <h1>Wallet</h1>

      <div style={{
        padding: "20px",
        background: "#111",
        borderRadius: "10px",
        marginTop: "20px"
      }}>
        <h2>Balance</h2>
        <h1>PKR 0</h1>
      </div>

    </PortalLayout>
  );
}
