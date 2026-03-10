import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  const { data, error } = await supabase
    .from("merchant_settings")
    .select("*")
    .eq("id",1)
    .single();

  if(error){
    return res.status(500).json({
      success:false
    });
  }

  return res.status(200).json({
    success:true,
    settings:data
  });

}
