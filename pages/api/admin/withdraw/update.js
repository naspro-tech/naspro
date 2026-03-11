import supabase from "../../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({success:false});
  }

  const { id,status,txn_id } = req.body;

  try{

    const { error } = await supabase
      .from("withdraws")
      .update({
        status,
        txn_id
      })
      .eq("id",id);

    if(error) throw error;

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
