import supabase from "../../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({
      success:false
    });
  }

  const { id } = req.body;

  if(!id){
    return res.status(400).json({
      success:false
    });
  }

  try{

    const { error } = await supabase
      .from("withdraw_requests")
      .update({
        status:"REJECTED"
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
