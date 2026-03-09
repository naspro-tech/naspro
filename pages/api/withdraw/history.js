import supabase from "../../../lib/supabase";

export default async function handler(req,res){

  try{

    const { data,error } = await supabase
      .from("withdraw_requests")
      .select("*")
      .order("created_at",{ ascending:false });

    if(error){
      return res.status(500).json({
        success:false,
        message:error.message
      });
    }

    return res.status(200).json({
      success:true,
      data
    });

  }catch(err){

    return res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

}
