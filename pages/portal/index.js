// pages/portal/index.js

import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function PartnerPortal() {
  // Login / auth states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [partner, setPartner] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dashboard / data states
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [successTxns, setSuccessTxns] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  // Withdraw form states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMobile, setWithdrawMobile] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Bank");
  const [loading, setLoading] = useState(false);

  // Sidebar / menu
  const [menu, setMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const validUsers = {
    betjee: "Betjee1234",
    crickex: "Crickex1234",
  };

  // Persistent login
  useEffect(() => {
    const storedPartner = localStorage.getItem("partner");
    if (storedPartner) {
      setPartner(storedPartner);
      setIsAuthenticated(true);
      fetchDashboardData(storedPartner);
    }
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (validUsers[username.toLowerCase()] === password) {
      const user = username.toLowerCase();
      localStorage.setItem("partner", user);
      setPartner(user);
      setIsAuthenticated(true);
      fetchDashboardData(user);
    } else {
      alert("Invalid username or password");
    }
  };

  // Fetch dashboard data (replace with real API calls)
  const fetchDashboardData = async (partner) => {
    setLoading(true);

    try {
      // TODO: Replace dummy data with actual API calls
      const dummyTransactions = [
        {
          orderId: "ORD001",
          amount: 100000,
          fee: 986,
          commission: 4000,
          netAmount: 95414,
          status: "APPROVED",
          createdAt: new Date(),
        },
        {
          orderId: "ORD002",
          amount: 5000,
          fee: 0,
          commission: 0,
          netAmount: 0,
          status: "PENDING",
          createdAt: new Date(),
        },
        {
          orderId: "ORD003",
          amount: 2000,
          fee: 0,
          commission: 0,
          netAmount: 0,
          status: "FAILED",
          createdAt: new Date(),
        },
      ];

      const dummyWithdrawals = [
        {
          mobile: "03001234567",
          method: "Bank",
          amount: 20000,
          commission: 400,
          status: "PENDING",
          screenshotUrl: "",
          createdAt: new Date(),
        },
      ];

      setTransactions(dummyTransactions);
      setWithdrawals(dummyWithdrawals);

      // Calculate KPIs
      const approvedTxns = dummyTransactions.filter((t) => t.status === "APPROVED");
      const totalNet = approvedTxns.reduce((acc, t) => acc + t.netAmount, 0);
      const fees = approvedTxns.reduce((acc, t) => acc + t.fee, 0);
      const depositCommission = approvedTxns.reduce((acc, t) => acc + t.commission, 0);
      const withdrawCommission = dummyWithdrawals.reduce((acc, w) => acc + w.commission, 0);

      const totalWithdrawn = dummyWithdrawals.reduce((acc, w) => acc + w.amount, 0);

      setAvailableBalance(totalNet - totalWithdrawn);
      setTotalTxns(dummyTransactions.length);
      setSuccessTxns(approvedTxns.length);
      setTotalFees(fees);
      setTotalCommission(depositCommission + withdrawCommission);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw request
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (amount > availableBalance) {
      alert("Cannot withdraw more than available balance");
      return;
    }
    if (!withdrawMobile) {
      alert("Enter mobile number");
      return;
    }

    // TODO: Call backend API to create withdrawal
    const commission = amount * 0.02; // 2% commission
    const newWithdraw = {
      mobile: withdrawMobile,
      method: withdrawMethod,
      amount,
      commission,
      status: "PENDING",
      screenshotUrl: "",
      createdAt: new Date(),
    };

    setWithdrawals([newWithdraw, ...withdrawals]);
    setAvailableBalance(availableBalance - amount);
    setWithdrawAmount("");
    setWithdrawMobile("");
    alert("Withdrawal requested successfully!");
  };

  // Status badge helper
  const statusColor = (status) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "FAILED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-800 to-indigo-900 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Partner Portal Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed z-50 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <span className="text-2xl font-bold">My Portal</span>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { name: "Dashboard", key: "dashboard" },
            { name: "Overall Summary", key: "overall" },
            { name: "Balance Summary", key: "balance" },
            { name: "Transactions", key: "transactions" },
            { name: "Withdrawals", key: "withdrawals" },
            { name: "Our Commission", key: "commission" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setMenu(item.key)}
              className={`flex items-center w-full p-2 rounded hover:bg-gray-800 ${
                menu === item.key ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("partner");
            window.location.reload();
          }}
          className="flex items-center p-4 mt-auto hover:bg-gray-800"
        >
          Logout
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-gray-900 text-white p-2 rounded"
        onClick={() => setSidebarOpen(true)}
      >
        <FiMenu size={24} />
      </button>

      {/* Main Content */}
      <div className="flex-1 p-6 ml-0 md:ml-64 overflow-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {menu === "dashboard" && (
              <>
                {/* Top Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
                  <div className="bg-white shadow rounded p-5">
                    <p className="text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold">{totalTxns}</p>
                  </div>
                  <div className="bg-white shadow rounded p-5">
                    <p className="text-gray-500">Successful Transactions</p>
                    <p className="text-2xl font-bold">{successTxns}</p>
                  </div>
                  <div className="bg-white shadow rounded p-5">
                    <p className="text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold">PKR {availableBalance.toLocaleString()}</p>
                  </div>
                  <div className="bg-white shadow rounded p-5">
                    <p className="text-gray-500">Total Fees</p>
                    <p className="text-2xl font-bold">PKR {totalFees.toLocaleString()}</p>
                  </div>
                  <div className="bg-white shadow rounded p-5">
                    <p className="text-gray-500">Total Commission</p>
                    <p className="text-2xl font-bold">PKR {totalCommission.toLocaleString()}</p>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white shadow rounded p-5 overflow-x-auto mb-6">
                  <h2 className="text-lg font-bold mb-4">Transactions</h2>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Order ID</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Fee</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Commission</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Net</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((t) => (
                        <tr key={t.orderId}>
                          <td className="px-4 py-2">{t.orderId}</td>
                          <td className="px-4 py-2">PKR {t.amount}</td>
                          <td className="px-4 py-2">{t.status === "APPROVED" ? t.fee : "-"}</td>
                          <td className="px-4 py-2">{t.status === "APPROVED" ? t.commission : "-"}</td>
                          <td className="px-4 py-2">{t.status === "APPROVED" ? t.netAmount : "-"}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${statusColor(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Withdrawals */}
                <div className="bg-white shadow rounded p-5 mb-6">
                  <h2 className="text-lg font-bold mb-4">Request Withdrawal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={withdrawMobile}
                      onChange={(e) => setWithdrawMobile(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    >
                      <option>Bank</option>
                      <option>EasyPaisa</option>
                      <option>JazzCash</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <button
                      onClick={handleWithdraw}
                      className="bg-blue-600 text-white rounded px-3 py-2 w-full hover:bg-blue-700"
                    >
                      Withdraw
                    </button>
                  </div>

                  <h3 className="text-md font-semibold mb-2">Withdrawal History</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Mobile</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Method</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Commission</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {withdrawals.map((w, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2">{w.mobile}</td>
                            <td className="px-4 py-2">{w.method}</td>
                            <td className="px-4 py-2">PKR {w.amount}</td>
                            <td className="px-4 py-2">PKR {w.commission}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                w.status === "PAID"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Other menu screens (placeholders) */}
            {menu === "overall" && <div>Overall Summary Page</div>}
            {menu === "balance" && <div>Balance Summary Page</div>}
            {menu === "transactions" && <div>Transactions Page</div>}
            {menu === "withdrawals" && <div>Withdrawals Page</div>}
            {menu === "commission" && <div>Our Commission Page</div>}
          </>
        )}
      </div>
    </div>
  );
                }
