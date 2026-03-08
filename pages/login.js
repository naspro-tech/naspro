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
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

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
      height:"100vh",
      background:"#f0f7ff"
    }}>

      <form
        onSubmit={handleLogin}
        style={{
          background:"#0f172a",
          color:"#fff",
          padding:"30px",
          borderRadius:"10px",
          width:"320px"
        }}
      >

        <h2 style={{marginBottom:"20px"}}>
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"15px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"20px"
          }}
        />

        <button
          type="submit"
          style={{
            width:"100%",
            padding:"10px",
            background:"#2563eb",
            color:"#fff",
            border:"none",
            borderRadius:"5px"
          }}
        >
          Login
        </button>

      </form>

    </div>

  );
            }
