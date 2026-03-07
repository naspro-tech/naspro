import Link from "next/link";

export default function PortalLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>

      <div style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px"
      }}>

        <h2>Merchant Panel</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>

          <li><Link href="/portal">Dashboard</Link></li>
          <li><Link href="/portal/wallet">Wallet</Link></li>
          <li><Link href="/portal/usdt-request">USDT Request</Link></li>
          <li><Link href="/portal/transactions">Transactions</Link></li>
          <a href="/portal/withdraw">Withdraw</a>
          <li><Link href="/portal/reports">Report</Link></li>
          <li><Link href="/portal/add-user">Add User</Link></li>
          <li><Link href="/portal/status-inquiry">Status Inquiry</Link></li>
          <li><Link href="/portal/links">Links</Link></li>
          <li><Link href="/portal/settings">Settings</Link></li>

        </ul>

      </div>

      <div style={{ flex: 1, padding: "30px" }}>
        {children}
      </div>

    </div>
  );
  }
