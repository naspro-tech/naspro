import AdminLayout from "../../components/AdminLayout";

export default function Transactions() {

  const transactions = [
    {
      id: "TXN1001",
      merchant: "Test Merchant",
      amount: "500 PKR",
      status: "Success",
      date: "2026-03-08"
    },
    {
      id: "TXN1002",
      merchant: "Demo Store",
      amount: "1200 PKR",
      status: "Pending",
      date: "2026-03-08"
    }
  ];

  return (
    <AdminLayout>

      <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>
        Transactions
      </h1>

      <table style={{
        width: "100%",
        background: "#0f172a",
        color:"#fff",
        borderRadius: "10px",
        padding: "15px"
      }}>

        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.merchant}</td>
              <td>{t.amount}</td>
              <td>{t.status}</td>
              <td>{t.date}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </AdminLayout>
  );
}
