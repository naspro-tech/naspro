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
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const limit = 10;
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
    return { startDate: start?.toISOString(), endDate: end?.toISOString() };
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

  return (
    <div className="portal-container">
      {!isAuthenticated ? (
        <form className="login-card" onSubmit={handleLogin}>
          <h2>🔐 Partner Portal Login</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
            {filter === "custom" && (
              <>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </>
            )}
            <button onClick={() => fetchTransactions(partner, 1)}>Apply</button>
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
                  <th>Payment</th>
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
                    <td>{t.payment_method}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => fetchTransactions(partner, page - 1)} disabled={page === 1}>⬅ Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => fetchTransactions(partner, page + 1)} disabled={page === totalPages}>Next ➡</button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .portal-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .login-card, .transactions-card {
          background: #111827;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          width: 90%;
          max-width: 850px;
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }
        th { color: #38bdf8; }
      `}</style>
    </div>
  );
        }
          
