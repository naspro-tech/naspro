// /pages/checkout.js
export default function Checkout() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>JazzCash Checkout</h1>
      <form method="POST" action="/api/checkout">
        <div>
          <label>Amount (in paisa):</label>
          <input type="text" name="amount" defaultValue="30000" required />
        </div>

        <div>
          <label>Phone:</label>
          <input type="text" name="phone" defaultValue="03123456789" required />
        </div>

        <div>
          <label>CNIC:</label>
          <input type="text" name="cnic" defaultValue="345678" required />
        </div>

        <div>
          <label>Bill Reference:</label>
          <input type="text" name="billReference" defaultValue="billRef123" required />
        </div>

        <div>
          <label>Description:</label>
          <input type="text" name="description" defaultValue="Testing" />
        </div>

        <button type="submit" style={{ marginTop: "20px" }}>Checkout</button>
      </form>
    </div>
  );
  }
