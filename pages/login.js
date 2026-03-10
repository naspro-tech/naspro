import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    setLoading(false);

    if(data.success){

      if(data.role === "admin"){
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
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      flexDirection:"column",
      height:"100vh",
      background:"#f0f7ff"
    }}>

      {/* BRAND HEADER */}

      <div style={{textAlign:"center", marginBottom:"25px"}}>

        <h1 style={{
          margin:"0",
          fontSize:"26px",
          fontWeight:"700",
          color:"#0f172a"
        }}>
          NASPRO PAYMENT GATEWAY
        </h1>

        <p style={{
          fontSize:"14px",
          color:"#64748b",
          marginTop:"5px"
        }}>
          Merchant Secure Login
        </p>

      </div>


      {/* LOGIN CARD */}

      <form
        onSubmit={handleLogin}
        style={{
          background:"#ffffff",
          padding:"40px",
          borderRadius:"16px",
          width:"360px",
          boxShadow:"0 10px 30px rgba(0,0,0,0.08)"
        }}
      >

        <div style={{marginBottom:"18px"}}>

          <label style={{
            fontSize:"14px",
            color:"#475569"
          }}>
            Email address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{
              width:"100%",
              padding:"12px",
              marginTop:"6px",
              borderRadius:"8px",
              border:"1px solid #cbd5e1"
            }}
          />

        </div>


        <div style={{
          marginBottom:"25px",
          position:"relative"
        }}>

          <label style={{
            fontSize:"14px",
            color:"#475569"
          }}>
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{
              width:"100%",
              padding:"12px",
              marginTop:"6px",
              borderRadius:"8px",
              border:"1px solid #cbd5e1"
            }}
          />

          <span
            onClick={()=>setShowPassword(!showPassword)}
            style={{
              position:"absolute",
              right:"12px",
              top:"38px",
              fontSize:"13px",
              color:"#2563eb",
              cursor:"pointer"
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>

        </div>


        <button
          type="submit"
          disabled={loading}
          style={{
            width:"100%",
            padding:"12px",
            borderRadius:"10px",
            border:"none",
            background:"linear-gradient(90deg,#3b82f6,#06b6d4)",
            color:"#fff",
            fontWeight:"600",
            cursor:"pointer"
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

      </form>

    </div>

  );

}
