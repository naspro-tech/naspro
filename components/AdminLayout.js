import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>

      <div style={{
        width: "220px",
        background: "#111827",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px"
      }}>

        <h2 style={{ marginBottom: "25px" }}>
          Admin Panel
        </h2>

        <ul style={{ listStyle: "none", padding: 0, lineHeight: "6.2" }}>

          <li>
            <Link href="/admin" style={{ color:"#fff", textDecoration:"none" }}>
              Dashboard
            </Link>
          </li>

          <li>
            <Link href="/admin/merchants" style={{ color:"#fff", textDecoration:"none" }}>
              Merchants
            </Link>
          </li>

          <li>
            <Link href="/admin/transactions" style={{ color:"#fff", textDecoration:"none" }}>
              Transactions
            </Link>
          </li>

          <li>
            <Link href="/admin/withdraws" style={{ color:"#fff", textDecoration:"none" }}>
              Withdraw Requests
            </Link>
          </li>

          <li>
            <Link href="/admin/usdt-requests" style={{ color:"#fff", textDecoration:"none" }}>
              USDT Requests
            </Link>
          </li>

          <li>
            <Link href="/admin/settings" style={{ color:"#fff", textDecoration:"none" }}>
              Settings
            </Link>
          </li>

        </ul>

      </div>

      <div style={{
        flex: 1,
        padding: "30px",
        background:"#f0f7ff"
      }}>
        {children}
      </div>

    </div>
  );
            }
