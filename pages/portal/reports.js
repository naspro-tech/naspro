import { useState } from "react";
import PortalLayout from "../../components/PortalLayout";

export default function Reports() {

  const [start,setStart] = useState("");
  const [end,setEnd] = useState("");

  const downloadReport = async (type) => {

    let url = `/api/reports/download?type=${type}`;

    if(type === "custom"){
      if(!start || !end){
        alert("Select start and end date");
        return;
      }
      url += `&start=${start}&end=${end}`;
    }

    try{

      const res = await fetch(url);

      if(!res.ok){
        alert("Failed to download report");
        return;
      }

      const blob = await res.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${type}-transactions.csv`;
      a.click();

    }catch(err){
      alert("Server error");
    }

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px",marginBottom:"30px"}}>
        Reports
      </h1>

      <div style={{marginBottom:"30px"}}>

        <button
          onClick={()=>downloadReport("daily")}
          style={{marginRight:"10px",padding:"10px"}}
        >
          Daily Report
        </button>

        <button
          onClick={()=>downloadReport("weekly")}
          style={{marginRight:"10px",padding:"10px"}}
        >
          Weekly Report
        </button>

        <button
          onClick={()=>downloadReport("monthly")}
          style={{marginRight:"10px",padding:"10px"}}
        >
          Monthly Report
        </button>

      </div>

      <div style={{
        background:"#0f172a",
        padding:"20px",
        borderRadius:"10px",
        color:"#fff",
        maxWidth:"400px"
      }}>

        <h3 style={{marginBottom:"20px"}}>
          Custom Date Range
        </h3>

        <p>Start Date</p>
        <input
          type="date"
          value={start}
          onChange={(e)=>setStart(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"20px"}}
        />

        <p>End Date</p>
        <input
          type="date"
          value={end}
          onChange={(e)=>setEnd(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"20px"}}
        />

        <button
          onClick={()=>downloadReport("custom")}
          style={{
            padding:"10px",
            background:"#22c55e",
            border:"none",
            color:"#fff"
          }}
        >
          Download Custom Report
        </button>

      </div>

    </PortalLayout>
  );

            }
