import { useState } from "react";

export default function Portal() {

const [loggedIn,setLoggedIn] = useState(false)
const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

function login(){

if(email==="admin@portal.com" && password==="123456"){
setLoggedIn(true)
}else{
alert("Invalid Login")
}

}

if(!loggedIn){

return(

<div style={styles.loginPage}>

<div style={styles.loginBox}>

<h2>Merchant Portal Login</h2>

<input
placeholder="Email"
style={styles.input}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
style={styles.input}
onChange={(e)=>setPassword(e.target.value)}
/>

<button style={styles.button} onClick={login}>Login</button>

<p style={{fontSize:12,marginTop:15,color:"#777"}}>
Demo Login<br/>
admin@portal.com<br/>
123456
</p>

</div>

</div>

)

}

return(

<div style={styles.container}>

<div style={styles.sidebar}>

<h2>Portal</h2>

<p>Dashboard</p>
<p>Transactions</p>
<p>Withdraw</p>
<p>Settings</p>

</div>


<div style={styles.main}>

<h1>Dashboard</h1>

<div style={styles.cards}>

<div style={styles.card}>
<h3>Total Balance</h3>
<p>$24,320</p>
</div>

<div style={styles.card}>
<h3>Today's Volume</h3>
<p>$4,120</p>
</div>

<div style={styles.card}>
<h3>Total Transactions</h3>
<p>86</p>
</div>

<div style={styles.card}>
<h3>Pending Payout</h3>
<p>$6,200</p>
</div>

</div>


<h2>Recent Transactions</h2>

<table style={styles.table}>

<thead>
<tr>
<th>ID</th>
<th>Amount</th>
<th>Status</th>
<th>Date</th>
</tr>
</thead>

<tbody>

<tr>
<td>TX9321</td>
<td>$120</td>
<td style={{color:"lime"}}>Completed</td>
<td>2026-03-05</td>
</tr>

<tr>
<td>TX9322</td>
<td>$240</td>
<td style={{color:"orange"}}>Pending</td>
<td>2026-03-05</td>
</tr>

<tr>
<td>TX9323</td>
<td>$80</td>
<td style={{color:"lime"}}>Completed</td>
<td>2026-03-04</td>
</tr>

<tr>
<td>TX9324</td>
<td>$430</td>
<td style={{color:"red"}}>Failed</td>
<td>2026-03-04</td>
</tr>

</tbody>

</table>

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
background:"#0f172a",
color:"white"
},

loginBox:{
background:"#1e293b",
padding:40,
borderRadius:10,
width:320,
textAlign:"center"
},

input:{
width:"100%",
padding:10,
marginTop:10,
borderRadius:6,
border:"none"
},

button:{
width:"100%",
padding:10,
marginTop:15,
background:"#3b82f6",
color:"white",
border:"none",
borderRadius:6,
cursor:"pointer"
},

container:{
display:"flex",
background:"#0f172a",
minHeight:"100vh",
color:"white"
},

sidebar:{
width:220,
background:"#020617",
padding:20
},

main:{
flex:1,
padding:30
},

cards:{
display:"flex",
gap:20,
marginBottom:30
},

card:{
background:"#1e293b",
padding:20,
borderRadius:10,
flex:1
},

table:{
width:"100%",
background:"#1e293b",
borderCollapse:"collapse"
}

  }
