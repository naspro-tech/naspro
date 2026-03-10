import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

export default function Merchants() {

  const [merchants, setMerchants] = useState([]);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const res = await fetch("/api/admin/merchants");
      const data = await res.json();

      if (data.success) {
        setMerchants(data.merchants);
      }

    } catch (err) {
      console.error("Merchant load error:", err);
    }
  };

  const updateStatus = async (id, status) => {

    try {

      await fetch("/api/admin/update-merchant-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, status })
      });

      loadMerchants();

    } catch (err) {
      console.error("Update merchant error:", err);
    }

  };

  return (
    <AdminLayout>

      <h1 style={{fontSize:"26px", marginBottom:"20px"}}>
        Merchants
      </h1>

      <table style={{
        width:"100%",
        background:"#0f172a",
        color:"#fff",
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

                <button
                  style={{marginRight:"10px"}}
                  onClick={() => updateStatus(m.id,"Active")}
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(m.id,"Disabled")}
                >
                  Disable
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </AdminLayout>
  );

            }
