import Link from "next/link";

export default function PortalLayout({ children }) {

  const logout = async () => {

    try {

      await fetch("/api/auth/logout", {
        method: "POST"
      });

    } catch (err) {}

    // redirect to login page
    window.location.href = "/login";

  };

  return (
    <div style={{ display: "flex" }}>

      <div style={{
        width: "220px",
        background: "#0f172a",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px"
      }}>

        <h2 style={{ marginBottom: "25px" }}>
          Merchant Panel
        </h2>

        <ul style={{ listStyle: "none", padding: 0, lineHeight: "6.2" }}>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal" style={{ color: "#fff", textDecoration: "none" }}>
              Dashboard
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/wallet" style={{ color: "#fff", textDecoration: "none" }}>
              Wallet
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/usdt-request" style={{ color: "#fff", textDecoration: "none" }}>
              USDT Request
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/usdt-history" style={{ color: "#fff", textDecoration: "none" }}>
              USDT History
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/transactions" style={{ color: "#fff", textDecoration: "none" }}>
              Transactions
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/withdraw" style={{ color: "#fff", textDecoration: "none" }}>
              Withdraw
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/reports" style={{ color: "#fff", textDecoration: "none" }}>
              Report
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/add-user" style={{ color: "#fff", textDecoration: "none" }}>
              Add User
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/status-inquiry" style={{ color: "#fff", textDecoration: "none" }}>
              Status Inquiry
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/links" style={{ color: "#fff", textDecoration: "none" }}>
              Links
            </Link>
          </li>

          <li style={{ marginBottom: "9px" }}>
            <Link href="/portal/settings" style={{ color: "#fff", textDecoration: "none" }}>
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

      <div style={{ flex: 1, background:"#f0f7ff", padding: "30px" }}>
        {children}
      </div>

    </div>
  );
                }
