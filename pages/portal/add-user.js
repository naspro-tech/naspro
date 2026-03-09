import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function AddUser(){

  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [role,setRole] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);

  const createUser = async () => {

    if(!username || !email || !role){
      setMessage("Please fill all fields");
      return;
    }

    try{

      setLoading(true);
      setMessage("");

      const res = await fetch("/api/user/create",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          role
        })
      });

      const data = await res.json();

      if(data.success){
        setMessage("User created successfully");
        setUsername("");
        setEmail("");
        setRole("");
      }else{
        setMessage(data.message || "Failed to create user");
      }

    }catch(err){
      setMessage("Server error");
    }

    setLoading(false);

  };

  return(

    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        Add User
      </h1>

      <div style={{
        background:"#0f172a",
        color:"#fff",
        padding:"30px",
        borderRadius:"10px",
        maxWidth:"500px"
      }}>

        <p>Username</p>
        <input
          type="text"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"20px"}}
        />

        <p>Email</p>
        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"20px"}}
        />

        <p>Role</p>
        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"20px"}}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="finance">Finance</option>
          <option value="support">Support</option>
          <option value="developer">Developer</option>
        </select>

        <button
          onClick={createUser}
          disabled={loading}
          style={{
            padding:"10px 20px",
            background:"#22c55e",
            border:"none",
            cursor:"pointer"
          }}
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && (
          <p style={{marginTop:"20px"}}>
            {message}
          </p>
        )}

      </div>

    </PortalLayout>

  );
          }
