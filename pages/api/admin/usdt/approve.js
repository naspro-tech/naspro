import supabase from "../../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  const { id, proof_1, proof_2 } = req.body;

  if(!id || !proof_1 || !proof_2){
    return res.status(400).json({
      success:false,
      message:"Missing data"
    });
  }

  try{

    const { error } = await supabase
      .from("usdt_requests")
      .update({
        status:"APPROVED",
        proof_1:proof_1,
        proof_2:proof_2
      })
      .eq("id",id);

    if(error){
      console.error(error);
      return res.status(500).json({
        success:false
      });
    }

    res.status(200).json({
      success:true
    });

  }catch(err){

    console.error(err);

    res.status(500).json({
      success:false
    });

  }

}
