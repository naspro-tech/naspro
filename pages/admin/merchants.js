import AdminLayout from "../../components/AdminLayout";

export default function Merchants() {

  const merchants = [
    { id: 1, name: "Test Merchant", email: "merchant@test.com", status: "Active" },
    { id: 2, name: "Demo Store", email: "demo@store.com", status: "Pending" }
  ];

  return (
    <AdminLayout>

      <h1 style={{fontSize:"26px", marginBottom:"20px"}}>
        Merchants
      </h1>

      <table style={{
        width:"100%",
        background:"#fff",
        borderRadius:"10px",
        padding:"10px"
      }}>

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {merchants.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.status}</td>
              <td>
                <button style={{marginRight:"10px"}}>Approve</button>
                <button>Disable</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </AdminLayout>
  );
            }
