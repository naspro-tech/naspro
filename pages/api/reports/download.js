import supabase from "../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "GET"){
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  try{

    const { type,start,end } = req.query;

    const now = new Date();
    let startDate;
    let endDate = now;

    if(type === "daily"){
      startDate = new Date();
      startDate.setDate(now.getDate()-1);
    }

    else if(type === "weekly"){
      startDate = new Date();
      startDate.setDate(now.getDate()-7);
    }

    else if(type === "monthly"){
      startDate = new Date();
      startDate.setMonth(now.getMonth()-1);
    }

    else if(type === "custom"){

      if(!start || !end){
        return res.status(400).json({
          success:false,
          message:"Missing date range"
        });
      }

      startDate = new Date(start);
      endDate = new Date(end);

    }

    else{
      return res.status(400).json({
        success:false,
        message:"Invalid report type"
      });
    }

    const { data,error } = await supabase
      .from("orders")
      .select("order_id,username,amount,status,created_at")
      .gte("created_at",startDate.toISOString())
      .lte("created_at",endDate.toISOString())
      .order("created_at",{ascending:false});

    if(error){
      return res.status(500).json({
        success:false,
        message:error.message
      });
    }

    let csv = "order_id,username,amount,status,date\n";

    (data || []).forEach(order=>{
      csv += `${order.order_id},${order.username},${order.amount},${order.status},${order.created_at}\n`;
    });

    res.setHeader("Content-Type","text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions-report.csv`
    );

    res.status(200).send(csv);

  }catch(err){

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

}
