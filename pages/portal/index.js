import { useEffect } from "react";
import { useRouter } from "next/router";
import {
Chart as ChartJS,
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement
} from "chart.js";

import { Pie,Bar } from "react-chartjs-2";

ChartJS.register(
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement
);

export default function Dashboard(){

const router = useRouter();

useEffect(()=>{
const auth = localStorage.getItem("auth");
if(!auth){
router.push("/login");
}
},[]);

const pieData = {
labels:["Easypaisa","JazzCash"],
datasets:[
{
data:[60,40],
backgroundColor:["#3b82f6","#10b981"]
}
]
}

const barData = {
labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
datasets:[
{
label:"Transactions",
data:[20,35,25,40,50,30,60],
backgroundColor:"#2563eb"
}
]
}

return(

<div style={{display:"flex",height:"100vh",fontFamily:"Arial"}}>

{/* Sidebar */}

<div style={{
width:"220px",
background:"#0f172a",
color:"white",
padding:"20px"
}}>

<h2>NASPRO</h2>

<ul style={{listStyle:"none",padding:0,marginTop:"30px"}}>
<li style={{marginBottom:"15px"}}>Dashboard</li>
<li style={{marginBottom:"15px"}}>Transactions</li>
<li style={{marginBottom:"15px"}}>Reports</li>
<li style={{marginBottom:"15px"}}>Settings</li>
</ul>

</div>

{/* Main */}

<div style={{flex:1,padding:"30px",background:"#f1f5f9"}}>

<h1>Dashboard</h1>

{/* Balance cards */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"20px",
marginTop:"20px"
}}>

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Total Volume</h3>
<h2>PKR 2,430,000</h2>
</div>

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Total Transactions</h3>
<h2>1,283</h2>
</div>

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Available Balance</h3>
<h2>PKR 420,000</h2>
</div>

</div>

{/* Charts */}

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px",
marginTop:"30px"
}}>

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Transactions by Gateway</h3>
<Pie data={pieData}/>
</div>

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Weekly Transactions</h3>
<Bar data={barData}/>
</div>

</div>

{/* Table */}

<div style={{
background:"white",
marginTop:"30px",
padding:"20px",
borderRadius:"10px"
}}>

<h3>Recent Transactions</h3>

<table style={{width:"100%",marginTop:"10px"}}>

<thead>
<tr>
<th>Order ID</th>
<th>User</th>
<th>Amount</th>
<th>Status</th>
</tr>
</thead>

<tbody>

<tr>
<td>NASPRO-001</td>
<td>Ali Khan</td>
<td>PKR 5,000</td>
<td style={{color:"green"}}>SUCCESS</td>
</tr>

<tr>
<td>NASPRO-002</td>
<td>Usman</td>
<td>PKR 2,000</td>
<td style={{color:"green"}}>SUCCESS</td>
</tr>

<tr>
<td>NASPRO-003</td>
<td>Ahmed</td>
<td>PKR 7,000</td>
<td style={{color:"orange"}}>PENDING</td>
</tr>

</tbody>

</table>

</div>

</div>

</div>

)
  }
