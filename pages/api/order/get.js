import supabase from "../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "GET"){
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  try{

    const { orderId } = req.query;

    if(!orderId){
      return res.status(400).json({
        success:false,
        message:"Order ID required"
      });
    }

    const { data,error } = await supabase
      .from("orders")
      .select("order_id,username,amount,status,created_at")
      .eq("order_id",orderId)
      .single();

    if(error || !data){
      return res.status(404).json({
        success:false,
        message:"Order not found"
      });
    }

    return res.status(200).json(data);

  }catch(err){

    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }

}
