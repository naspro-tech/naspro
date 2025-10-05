import { useState } from "react";

export default function Testing() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [amount, setAmount] = useState("");

  const paymentOptions = [
    { name: "EasyPaisa", color: "#00b894" },
    { name: "JazzCash", color: "#0984e3" },
    { name: "Bank Transfer", color: "#636e72" },
    { name: "Nayapay", color: "#fd79a8" },
  ];

  const channelsMap = {
    EasyPaisa: ["Jeeway", "Jeepay"],
    JazzCash: ["JazzChannel1", "JazzChannel2"],
    "Bank Transfer": ["BankA", "BankB"],
    Nayapay: ["Nayapay1"],
  };

  const presetAmounts = [200, 500, 1000, 1250];

  const selectService = (service) => {
    setSelectedService(service);
    setSelectedChannel("");
    setAmount("");
  };

  const selectChannel = (channel) => {
    setSelectedChannel(channel);
    setAmount("");
  };

  const selectAmount = (value) => setAmount(value);

  const submitDeposit = (e) => {
    e.preventDefault();
    const numericAmount = parseInt(amount);
    if (!numericAmount || numericAmount < 1 || numericAmount > 50000) {
      alert("Please enter a valid amount between 1 and 50,000.");
      return;
    }
    const redirectUrl = `https://naspropvt.vercel.app/pay?amount=${numericAmount}&service=${encodeURIComponent(selectedChannel)}`;
    window.open(redirectUrl, "_blank");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Deposit Page</h2>

      {/* Payment Options */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
        {paymentOptions.map((option) => (
          <div
            key={option.name}
            onClick={() => selectService(option.name)}
            style={{
              cursor: "pointer",
              padding: "20px",
              borderRadius: "10px",
              flex: "1 1 120px",
              textAlign: "center",
              color: "#fff",
              backgroundColor: selectedService === option.name ? "#333" : option.color,
              transition: "transform 0.2s",
            }}
          >
            {option.name}
          </div>
        ))}
      </div>

      {/* Channels */}
      {selectedService && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "10px" }}>Select Channel for {selectedService}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {channelsMap[selectedService].map((channel) => (
              <div
                key={channel}
                onClick={() => selectChannel(channel)}
                style={{
                  cursor: "pointer",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: selectedChannel === channel ? "#4CAF50" : "#e0e0e0",
                  color: selectedChannel === channel ? "#fff" : "#000",
                  flex: "1 1 100px",
                  textAlign: "center",
                }}
              >
                {channel}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amount Selection */}
      {selectedChannel && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "10px" }}>Select Amount</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
            {presetAmounts.map((amt) => (
              <div
                key={amt}
                onClick={() => selectAmount(amt)}
                style={{
                  cursor: "pointer",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  backgroundColor: amount == amt ? "#4CAF50" : "#e0e0e0",
                  color: amount == amt ? "#fff" : "#000",
                  textAlign: "center",
                }}
              >
                {amt}
              </div>
            ))}
          </div>

          <form onSubmit={submitDeposit} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="50000"
              required
              style={{ flex: "1", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0984e3",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Deposit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
