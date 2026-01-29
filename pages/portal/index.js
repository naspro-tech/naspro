import { useState } from "react";

export default function PartnerPortal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [partner, setPartner] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const limit = 10;

  // TEMP login (keep for now)
  const validUsers = {
    betjee: "Betjee1234",
    crickex: "Crickex1234",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (validUsers[username.toLowerCase()] === password) {
      setPartner(username.toLowerCase());
      setIsAuthenticated(true);
      fetchTransactions(username.toLowerCase(), 1);
    } else {
      alert("Invalid username or password");
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let start, end;

    if (filter === "today") {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date();
    } else if (filter === "week") {
      const first = now.getDate() - now.getDay();
      start = new Date(now.setDate(first));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (filter === "custom") {
      start = new Date(customStart);
      end = new Date(customEnd);
    }

    return {
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    };
  };

  const fetchTransactions = async (partner, currentPage = 1) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const params = new URLSearchParams({
        partner,
        page: currentPage,
        limit,
        startDate,
        endDate,
      });

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/transactions/get?${params}`);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.transactions);
        setTotalAmount(data.totalAmount);
        setTotalCount(data.totalCount);
        setPage(currentPage);
      } else {
        alert("Failed to load transactions");
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const statusColor = (status) => {
    if (status === "APPROVED") return "#22c55e";
    if (status === "FAILED") return "#ef4444";
    return "#facc15";
  };

  return (
    <div className="portal-container">
      {!isAuthenticated ? (
        <form className="login-card" onSubmit={handleLogin}>
          <h2>🔐 Partner Portal Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <div className="transactions-card">
          <h2>💰 Transactions for {partner.toUpperCase()}</h2>

          <div className="filter-bar">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="custom">Custom</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>

            {filter === "custom" && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </>
            )}

            <button onClick={() => fetchTransactions(partner, 1)}>
              Apply
            </button>
          </div>

          <div className="summary-box">
            <p><strong>Total Transactions:</strong> {totalCount}</p>
            <p><strong>Total Amount:</strong> PKR {totalAmount.toLocaleString()}</p>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{t.orderId}</td>
                    <td>{t.service}</td>
                    <td>PKR {t.amount}</td>
                    <td>{t.mobile}</td>
                    <td>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: statusColor(t.status),
                        }}
                      >
                        {t.status}
                      </div>
                      {t.status === "FAILED" && t.responseMessage && (
                        <div style={{ fontSize: "12px", color: "#fca5a5" }}>
                          {t.responseMessage}
                        </div>
                      )}
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchTransactions(partner, page - 1)}
                disabled={page === 1}
              >
                ⬅ Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => fetchTransactions(partner, page + 1)}
                disabled={page === totalPages}
              >
                Next ➡
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
    }
