import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminLayout({ children }) {

  const router = useRouter();

  const logout = () => {

    // remove admin session
    localStorage.removeItem("admin_token");

    // redirect to login
    router.push("/admin/login");

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

        <ul style={{ listStyle: "none", padding: 0, lineHeight: "3.2" }}>

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

          {/* Logout Button */}

          <li style={{ marginTop: "25px" }}>
            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: "10px",
                background: "#ef4444",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                borderRadius: "5px"
              }}
            >
              Logout
            </button>
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
