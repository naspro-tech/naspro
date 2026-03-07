import PortalLayout from "../../components/PortalLayout";

export default function Reports() {

  const downloadReport = async (type) => {

    const res = await fetch(`/api/reports/download?type=${type}`);

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-transactions.csv`;
    a.click();

  };

  return (
    <PortalLayout>

      <h1 style={{fontSize:"28px", marginBottom:"30px"}}>
        Reports
      </h1>

      <div style={{marginBottom:"30px"}}>

        <button
          onClick={()=>downloadReport("daily")}
          style={{marginRight:"10px", padding:"10px"}}
        >
          Download Daily Report
        </button>

        <button
          onClick={()=>downloadReport("weekly")}
          style={{marginRight:"10px", padding:"10px"}}
        >
          Download Weekly Report
        </button>

        <button
          onClick={()=>downloadReport("monthly")}
          style={{padding:"10px"}}
        >
          Download Monthly Report
        </button>

      </div>

    </PortalLayout>
  );
                 }
