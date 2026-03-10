import { useState, useEffect } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Settings() {

  const [apiKey, setApiKey] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {

    const res = await fetch("/api/settings/get");
    const data = await res.json();

    if (data.success) {
      setApiKey(data.settings.api_key || "");
      setCallbackUrl(data.settings.callback_url || "");
      setWebhookUrl(data.settings.webhook_url || "");
    }

  };

  const saveSettings = async () => {

    setMessage("Saving...");

    const res = await fetch("/api/settings/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        callback_url: callbackUrl,
        webhook_url: webhookUrl
      })
    });

    const data = await res.json();

    if (data.success) {
      setMessage("✅ Settings updated successfully");
    } else {
      setMessage("❌ Error updating settings");
    }

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"30px"}}>
        Merchant Settings
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        padding:"30px",
        borderRadius:"10px",
        maxWidth:"600px"
      }}>

        <p>API Key</p>

        <input
          type="text"
          value={apiKey}
          readOnly
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px",
            background:"#0f172a",
            color:"#fff"
          }}
        />

        <p>Callback URL</p>

        <input
          type="text"
          placeholder="https://yourwebsite.com/api/payment-callback"
          value={callbackUrl}
          onChange={(e)=>setCallbackUrl(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px"
          }}
        />

        <p>Webhook URL (Optional)</p>

        <input
          type="text"
          placeholder="https://yourwebsite.com/api/webhook"
          value={webhookUrl}
          onChange={(e)=>setWebhookUrl(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px"
          }}
        />

        <button
          onClick={saveSettings}
          style={{
            padding:"10px 20px",
            background:"#22c55e",
            border:"none",
            cursor:"pointer",
            borderRadius:"5px"
          }}
        >
          Save Settings
        </button>

        <p style={{marginTop:"20px"}}>
          {message}
        </p>

      </div>

    </PortalLayout>
  );
}
