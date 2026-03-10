import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {

  const { data, error } = await supabase
    .from("merchant_settings")
    .select("*")
    .eq("id", 1)
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
