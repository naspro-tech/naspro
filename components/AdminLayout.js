import Link from "next/link";

export default function AdminLayout({ children }) {

  const logout = async () => {

    try {

      await fetch("/api/auth/logout", {
        method: "POST"
      });

    } catch (err) {}

    // redirect to admin login page
    window.location.href = "/admin/login";

  };

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
            <Link href="/admin/commission" style={{ color:"#fff", textDecoration:"none" }}>
              Commission
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

        {/* Logout Button */}

        <button
          onClick={logout}
          style={{
            marginTop: "40px",
            width: "100%",
            padding: "10px",
            background: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>

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
