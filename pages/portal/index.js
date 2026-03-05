import { useState, useEffect } from "react";

export default function Portal() {

const [loggedIn,setLoggedIn] = useState(false)
const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [error,setError] = useState("")

useEffect(()=>{
const savedLogin = localStorage.getItem("portalLogin")
if(savedLogin === "true"){
setLoggedIn(true)
}
},[])

const login = () => {

if(username === "admin" && password === "admin123"){
setLoggedIn(true)
localStorage.setItem("portalLogin","true")
}else{
setError("Invalid username or password")
}

}

const logout = () => {
localStorage.removeItem("portalLogin")
setLoggedIn(false)
}

if(!loggedIn){
return(

<div style={styles.loginPage}>

<div style={styles.loginBox}>

<h2 style={styles.title}>Client Portal</h2>

<input
placeholder="Username"
value={username}
onChange={(e)=>setUsername(e.target.value)}
style={styles.input}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={styles.input}
/>

<button onClick={login} style={styles.loginBtn}>
Login
</button>

<p style={{color:"red"}}>{error}</p>

</div>

</div>

)
}

return(

<div style={styles.portalWrapper}>

<div style={styles.sidebar}>

<h2>Portal</h2>

<p>Dashboard</p>
<p>Transaction history</p>
<p>Withdrawal Records</p>
<p>Support</p>
<p>Settings</p>

<button style={styles.logoutBtn} onClick={logout}>
Logout
</button>

</div>

<div style={styles.mainContent}>

<h1>Client Dashboard</h1>

<div style={styles.cardGrid}>

<div style={styles.card}>
<h3>Available balance</h3>
<p>137.98</p>
</div>

<div style={styles.card}>
<h3>Success Transaction Rate</h3>
<p>12%</p>
</div>

<div style={styles.card}>
<h3>Failed Transactions Rate</h3>
<p>3%</p>
</div>

<div style={styles.card}>
<h3>Withdraw Amount Total Today</h3>
<p>70</p>
</div>

</div>

</div>

</div>

)

}

const styles = {

loginPage:{
height:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#0f172a,#1e293b)",
},

loginBox:{
background:"#fff",
padding:"40px",
borderRadius:"10px",
width:"320px",
display:"flex",
flexDirection:"column",
gap:"10px"
},

title:{
textAlign:"center",
marginBottom:"10px"
},

input:{
padding:"10px",
border:"1px solid #ccc",
borderRadius:"6px"
},

loginBtn:{
padding:"10px",
background:"#2563eb",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
},

portalWrapper:{
display:"flex",
minHeight:"100vh",
background:"#f1f5f9"
},

sidebar:{
width:"220px",
background:"#0f172a",
color:"#fff",
padding:"20px",
display:"flex",
flexDirection:"column",
gap:"15px"
},

logoutBtn:{
marginTop:"auto",
padding:"10px",
background:"#ef4444",
border:"none",
color:"#fff",
borderRadius:"6px",
cursor:"pointer"
},

mainContent:{
flex:1,
padding:"40px"
},

cardGrid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:"20px",
marginTop:"20px"
},

card:{
background:"#fff",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)",
textAlign:"center"
}

  }
