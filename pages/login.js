import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if (data.success) {

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }

    } else {
      alert(data.message);
    }

  };

  return (

    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f0f7ff"
    }}>

      <form
        onSubmit={handleLogin}
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          width: "360px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >

        <h2 style={{
          textAlign: "center",
          marginBottom: "25px",
          color: "#0f172a"
        }}>
          Secure Login
        </h2>

        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontSize: "14px", color: "#475569" }}>
            Email address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ fontSize: "14px", color: "#475569" }}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1"
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Login Now
        </button>

      </form>

    </div>

  );

}
