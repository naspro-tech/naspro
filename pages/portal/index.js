import { useEffect, useState } from "react";

export default function Portal() {
  const [transactions, setTransactions] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalTxns, setTotalTxns] = useState(0);
  const [successTxns, setSuccessTxns] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  // 🔥 Replace this later with real API
  const fetchData = async () => {
    const dummy = [
      {
        order_id: "NASPRO-123456",
        username: "AliKhan",
        amount: 5000,
        status: "APPROVED",
        fee: 50,
        commission: 20,
        createdAt: new Date().toLocaleString(),
      },
      {
        order_id: "NASPRO-987654",
        username: "Ahmed",
        amount: 2000,
        status: "PENDING",
        fee: 20,
        commission: 10,
        createdAt: new Date().toLocaleString(),
      },
    ];

    setTransactions(dummy);

    const approved = dummy.filter(t => t.status === "APPROVED");

    setAvailableBalance(
      approved.reduce((acc, t) => acc + t.amount - t.fee, 0)
    );
    setTotalTxns(dummy.length);
    setSuccessTxns(approved.length);
    setTotalFees(approved.reduce((acc, t) => acc + t.fee, 0));
    setTotalCommission(approved.reduce((acc, t) => acc + t.commission, 0));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 p-6">
        <h2 className="text-2xl font-bold text-emerald-400 mb-10">
          NASPRO PSP
        </h2>

        <nav className="space-y-6 text-gray-400">
          <div className="hover:text-white cursor-pointer transition">
            📊 Dashboard
          </div>
          <div className="hover:text-white cursor-pointer transition">
            💳 Transactions
          </div>
          <div className="hover:text-white cursor-pointer transition">
            💸 Withdrawals
          </div>
          <div className="hover:text-white cursor-pointer transition">
            ⚙ Settings
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-3xl p-8 shadow-2xl mb-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="uppercase text-sm opacity-80">
                Available Balance
              </p>
              <h1 className="text-5xl font-bold mt-3">
                PKR {availableBalance.toLocaleString()}
              </h1>
              <p className="mt-2 text-sm opacity-80">
                Live Settlement Wallet
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <h2 className="text-3xl font-bold mt-3">{totalTxns}</h2>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Successful</p>
            <h2 className="text-3xl font-bold mt-3 text-emerald-400">
              {successTxns}
            </h2>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Fees</p>
            <h2 className="text-3xl font-bold mt-3 text-red-400">
              PKR {totalFees.toLocaleString()}
            </h2>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg">
            <p className="text-gray-400 text-sm">Commission</p>
            <h2 className="text-3xl font-bold mt-3 text-yellow-400">
              PKR {totalCommission.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#111827] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-[#1f2937] text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.order_id}
                  className="border-b border-gray-800 hover:bg-[#1e293b] transition"
                >
                  <td className="p-4 font-mono text-xs">
                    {txn.order_id}
                  </td>
                  <td className="p-4">{txn.username}</td>
                  <td className="p-4 font-semibold">
                    PKR {txn.amount}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        txn.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : txn.status === "PENDING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {txn.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
      }
